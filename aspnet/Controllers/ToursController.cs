
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using aspnet.Data;
using aspnet.Models;

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
    // También permite aplicar filtros mediante parámetros.
    [HttpGet]
    public async Task<IActionResult> ObtenerTours(
        [FromQuery(Name = "categoria_id")] int? categoriaId,
        [FromQuery] string? estado,
        [FromQuery(Name = "precio_min")] decimal? precioMin,
        [FromQuery(Name = "precio_max")] decimal? precioMax,
        [FromQuery(Name = "buscar")] string? buscar)
    {
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

        var tours = await consulta
            .OrderBy(t => t.Nombre)
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

        return Ok(tours);
    }

    // GET: /api/tours/1
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
}
