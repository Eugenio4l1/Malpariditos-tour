
using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using aspnet.Data;
using aspnet.Models;
using Microsoft.Extensions.DependencyInjection;

namespace aspnet.Tests;

public class ApiRestTest : IClassFixture<ApiFactory>
{
    private readonly ApiFactory _factory;
    private readonly HttpClient _client;

    public ApiRestTest(ApiFactory factory)
    {
        _factory = factory;
        _client = _factory.CreateClient();

        // Cada prueba comienza con una base de datos limpia.
        _factory.ResetDatabase();
    }

    private async Task<string> ObtenerTokenAdminAsync()
    {
        var respuesta = await _client.PostAsJsonAsync(
            "/api/auth/login",
            new
            {
                email = "admin@test.com",
                password = "Test123!"
            });

        respuesta.EnsureSuccessStatusCode();

        using var json = JsonDocument.Parse(
            await respuesta.Content.ReadAsStringAsync());

        return json.RootElement
            .GetProperty("data")
            .GetProperty("token")
            .GetString()!;
    }

    private void AgregarToken(string token)
    {
        _client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", token);
    }

    private int CrearTourEnBaseDeDatos()
    {
        using var scope = _factory.Services.CreateScope();

        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        var tour = new Tour
        {
            CategoriaId = 1,
            Nombre = "Tour de prueba",
            Descripcion = "Descripción del tour de prueba",
            Precio = 25000,
            DuracionHoras = 5,
            Estado = "activo"
        };

        db.Tours.Add(tour);
        db.SaveChanges();

        return tour.Id;
    }

    [Fact]
    public async Task ListarTours_Devuelve200()
    {
        var respuesta = await _client.GetAsync("/api/tours");

        Assert.Equal(HttpStatusCode.OK, respuesta.StatusCode);

        using var json = JsonDocument.Parse(
            await respuesta.Content.ReadAsStringAsync());

        Assert.Equal(
            JsonValueKind.Array,
            json.RootElement.ValueKind);
    }

    [Fact]
    public async Task ObtenerTourExistente_Devuelve200()
    {
        var id = CrearTourEnBaseDeDatos();

        var respuesta = await _client.GetAsync($"/api/tours/{id}");

        Assert.Equal(HttpStatusCode.OK, respuesta.StatusCode);

        using var json = JsonDocument.Parse(
            await respuesta.Content.ReadAsStringAsync());

        Assert.Equal(
            "Tour de prueba",
            json.RootElement.GetProperty("nombre").GetString());
    }

    [Fact]
    public async Task ObtenerTourInexistente_Devuelve404()
    {
        var respuesta = await _client.GetAsync("/api/tours/9999");

        Assert.Equal(HttpStatusCode.NotFound, respuesta.StatusCode);
    }

    [Fact]
    public async Task CrearTourSinToken_Devuelve401()
    {
        var respuesta = await _client.PostAsJsonAsync(
            "/api/tours",
            new
            {
                categoria_id = 1,
                nombre = "Tour nuevo",
                descripcion = "Descripción",
                precio = 30000,
                duracion_horas = 4,
                estado = "activo"
            });

        Assert.Equal(
            HttpStatusCode.Unauthorized,
            respuesta.StatusCode);
    }

    [Fact]
    public async Task CrearTourComoAdmin_Devuelve201ConLocation()
    {
        var token = await ObtenerTokenAdminAsync();
        AgregarToken(token);

        var respuesta = await _client.PostAsJsonAsync(
            "/api/tours",
            new
            {
                categoria_id = 1,
                nombre = "Tour nuevo",
                descripcion = "Descripción del tour nuevo",
                precio = 30000,
                duracion_horas = 4,
                estado = "activo"
            });

        Assert.Equal(
            HttpStatusCode.Created,
            respuesta.StatusCode);

        Assert.NotNull(respuesta.Headers.Location);
    }

    [Fact]
    public async Task ActualizarTourComoAdmin_Devuelve200()
    {
        var id = CrearTourEnBaseDeDatos();

        var token = await ObtenerTokenAdminAsync();
        AgregarToken(token);

        var respuesta = await _client.PatchAsJsonAsync(
            $"/api/tours/{id}",
            new
            {
                nombre = "Tour actualizado",
                precio = 35000
            });

        Assert.Equal(HttpStatusCode.OK, respuesta.StatusCode);

        using var json = JsonDocument.Parse(
            await respuesta.Content.ReadAsStringAsync());

        Assert.Equal(
            "Tour actualizado",
            json.RootElement
                .GetProperty("data")
                .GetProperty("nombre")
                .GetString());
    }

    [Fact]
    public async Task EliminarTourComoAdmin_Devuelve200()
    {
        var id = CrearTourEnBaseDeDatos();

        var token = await ObtenerTokenAdminAsync();
        AgregarToken(token);

        var respuesta = await _client.DeleteAsync(
            $"/api/tours/{id}");

        Assert.Equal(HttpStatusCode.OK, respuesta.StatusCode);
    }

    [Fact]
    public async Task CrearTourConDatosInvalidos_Devuelve400()
    {
        var token = await ObtenerTokenAdminAsync();
        AgregarToken(token);

        var respuesta = await _client.PostAsJsonAsync(
            "/api/tours",
            new
            {
                categoria_id = 1,
                nombre = "A",
                descripcion = "Descripción",
                precio = 0,
                duracion_horas = 0,
                estado = "incorrecto"
            });

        Assert.Equal(
            HttpStatusCode.BadRequest,
            respuesta.StatusCode);
    }
}
