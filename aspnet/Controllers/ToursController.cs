
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using System.Text.Json.Serialization;
using aspnet.Data;
using aspnet.Models;
using aspnet.Dtos;

namespace aspnet.Controllers;

[ApiController]
[Route("api/tours")]
public class ToursController : ControllerBase
{
    private readonly AppDbContext _context;

    public ToursController(AppDbContext context)
    {
        _context = context;
    }

    // GET: /api/tours
    [HttpGet]
    
// GET: /api/tours?page=1&per_page=15
[HttpGet]
public async Task<IActionResult> ObtenerTours(
    [FromQuery] int page = 1,
    [FromQuery] int per_page = 15,
    [FromQuery(Name = "categoria_id")] int? categoriaId = null,
    [FromQuery] string? estado = null,
    [FromQuery(Name = "precio_min")] decimal? precioMin = null,
    [FromQuery(Name = "precio_max")] decimal? precioMax = null,
    [FromQuery] string? buscar = null)
{
    const int TAMANO_MAXIMO = 50;

    page = Math.Max(1, page);
    per_page = Math.Clamp(per_page, 1, TAMANO_MAXIMO);

    IQueryable<Tour> consulta = _context.Tours.AsNoTracking();

    if (categoriaId.HasValue)
        consulta = consulta.Where(t => t.CategoriaId == categoriaId.Value);

    if (!string.IsNullOrWhiteSpace(estado))
        consulta = consulta.Where(t => t.Estado == estado);

    if (precioMin.HasValue)
        consulta = consulta.Where(t => t.Precio >= precioMin.Value);

    if (precioMax.HasValue)
        consulta = consulta.Where(t => t.Precio <= precioMax.Value);

    if (!string.IsNullOrWhiteSpace(buscar))
        consulta = consulta.Where(t => t.Nombre.Contains(buscar));

    var total = await consulta.CountAsync();

    var ultimaPagina = Math.Max(1, (int)Math.Ceiling((double)total / per_page));

    var tours = await consulta
        .OrderByDescending(t => t.CreatedAt)
        .Skip((page - 1) * per_page)
        .Take(per_page)
        .Select(t => new
        {
            id = t.Id,
            categoria_id = t.CategoriaId,
            nombre = t.Nombre,
            descripcion = t.Descripcion,
            precio = t.Precio,
            duracion_horas = t.DuracionHoras,
            estado = t.Estado,
            categoria = t.Categoria == null ? null : new
            {
                id = t.Categoria.Id,
                nombre = t.Categoria.Nombre
            },
            creado_en = t.CreatedAt,
            actualizado_en = t.UpdatedAt
        })
        .ToListAsync();

    return Ok(new
    {
        data = tours,
        meta = new
        {
            current_page = page,
            per_page,
            total,
            last_page = ultimaPagina
        }
    });
}


    // GET: /api/tours/{id}
    [HttpGet("{id:int}")]
    public async Task<IActionResult> ObtenerTour(int id)
    {
        var tour = await _context.Tours
            .AsNoTracking()
            .Where(t => t.Id == id)
            .Select(t => new
            {
                id = t.Id,
                categoria_id = t.CategoriaId,
                nombre = t.Nombre,
                descripcion = t.Descripcion,
                precio = t.Precio,
                duracion_horas = t.DuracionHoras,
                estado = t.Estado,
                categoria = t.Categoria == null ? null : new
                {
                    id = t.Categoria.Id,
                    nombre = t.Categoria.Nombre
                },
                creado_en = t.CreatedAt,
                actualizado_en = t.UpdatedAt
            })
            .FirstOrDefaultAsync();

        if (tour == null)
            return NotFound(new { mensaje = "Tour no encontrado." });

        return Ok(tour);
    }

    // POST: /api/tours
    [Authorize(Roles = "admin")]
    [HttpPost]
    public async Task<IActionResult> CrearTour(
        [FromBody] CrearTourRequest request)
    {
        bool categoriaExiste = await _context.Categorias
            .AnyAsync(c => c.Id == request.CategoriaId);

        if (!categoriaExiste)
            return BadRequest(new { mensaje = "La categoría indicada no existe." });

        var tour = new Tour
        {
            CategoriaId = request.CategoriaId,
            Nombre = request.Nombre.Trim(),
            Descripcion = request.Descripcion,
            Precio = request.Precio,
            DuracionHoras = request.DuracionHoras,
            Estado = request.Estado,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.Tours.Add(tour);
        await _context.SaveChangesAsync();

        return CreatedAtAction(
            nameof(ObtenerTour),
            new { id = tour.Id },
            new
            {
                mensaje = "Tour creado correctamente.",
                data = new
                {
                    id = tour.Id,
                    categoria_id = tour.CategoriaId,
                    nombre = tour.Nombre,
                    descripcion = tour.Descripcion,
                    precio = tour.Precio,
                    duracion_horas = tour.DuracionHoras,
                    estado = tour.Estado,
                    creado_en = tour.CreatedAt,
                    actualizado_en = tour.UpdatedAt
                }
            });
    }

    // PATCH: /api/tours/{id}
    [Authorize(Roles = "admin")]
    [HttpPatch("{id:int}")]
    public async Task<IActionResult> ActualizarTour(
        int id,
        [FromBody] ActualizarTourRequest request)
    {
        var tour = await _context.Tours.FindAsync(id);

        if (tour == null)
            return NotFound(new { mensaje = "Tour no encontrado." });

        if (request.CategoriaId.HasValue)
        {
            bool categoriaExiste = await _context.Categorias
                .AnyAsync(c => c.Id == request.CategoriaId.Value);

            if (!categoriaExiste)
                return BadRequest(new { mensaje = "La categoría indicada no existe." });

            tour.CategoriaId = request.CategoriaId.Value;
        }

        if (request.Nombre != null)
            tour.Nombre = request.Nombre.Trim();

        if (request.Descripcion != null)
            tour.Descripcion = request.Descripcion;

        if (request.Precio.HasValue)
            tour.Precio = request.Precio.Value;

        if (request.DuracionHoras.HasValue)
            tour.DuracionHoras = request.DuracionHoras.Value;

        if (request.Estado != null)
            tour.Estado = request.Estado;

        tour.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return Ok(new
        {
            mensaje = "Tour actualizado correctamente.",
            data = new
            {
                id = tour.Id,
                categoria_id = tour.CategoriaId,
                nombre = tour.Nombre,
                descripcion = tour.Descripcion,
                precio = tour.Precio,
                duracion_horas = tour.DuracionHoras,
                estado = tour.Estado,
                creado_en = tour.CreatedAt,
                actualizado_en = tour.UpdatedAt
            }
        });
    }

    // DELETE: /api/tours/{id}
    [Authorize(Roles = "admin")]
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> EliminarTour(int id)
    {
        var tour = await _context.Tours.FindAsync(id);

        if (tour == null)
            return NotFound(new { mensaje = "Tour no encontrado." });

        bool tieneReservasActivas = await _context.Reservas
            .AnyAsync(r =>
                r.SalidaTour != null &&
                r.SalidaTour.TourId == id &&
                (r.Estado == "pendiente" || r.Estado == "confirmada"));

        if (tieneReservasActivas)
        {
            return Conflict(new
            {
                mensaje = "No se puede eliminar el tour porque tiene reservas pendientes o confirmadas.",
                codigo = "TOUR_CON_DEPENDENCIAS"
            });
        }

        _context.Tours.Remove(tour);
        await _context.SaveChangesAsync();

        return Ok(new
        {
            mensaje = "Tour eliminado correctamente."
        });
    }
}

