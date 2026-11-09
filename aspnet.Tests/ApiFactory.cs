using aspnet.Data;
using aspnet.Models;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;

namespace aspnet.Tests;

public class ApiFactory : WebApplicationFactory<Program>
{
    private readonly SqliteConnection _connection =
        new("Data Source=:memory:");

    public ApiFactory()
    {
        _connection.Open();
    }

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.ConfigureServices(services =>
        {
            services.RemoveAll<DbContextOptions<AppDbContext>>();

            services.AddDbContext<AppDbContext>(options =>
                options.UseSqlite(_connection));
        });
    }

    public void ResetDatabase()
    {
        using var scope = Services.CreateScope();

        var db = scope.ServiceProvider
            .GetRequiredService<AppDbContext>();

        db.Database.EnsureDeleted();
        db.Database.EnsureCreated();

        db.Categorias.Add(new Categoria
        {
            Nombre = "Aventura",
            Descripcion = "Categoría de prueba"
        });

        db.Usuarios.AddRange(
            new Usuario
            {
                Nombre = "Administrador de pruebas",
                Email = "admin@test.com",
                Password = BCrypt.Net.BCrypt.HashPassword("Test123!"),
                Role = "admin"
            },
            new Usuario
            {
                Nombre = "Guía de pruebas",
                Email = "guia@test.com",
                Password = BCrypt.Net.BCrypt.HashPassword("Test123!"),
                Role = "guia"
            },
            new Usuario
            {
                Nombre = "Cliente de pruebas",
                Email = "cliente@test.com",
                Password = BCrypt.Net.BCrypt.HashPassword("Test123!"),
                Role = "cliente"
            }
        );

        db.SaveChanges();
    }

    protected override void Dispose(bool disposing)
    {
        if (disposing)
        {
            _connection.Dispose();
        }

        base.Dispose(disposing);
    }
}