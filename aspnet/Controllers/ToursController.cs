using Microsoft.AspNetCore.Mvc;

namespace aspnet.Controllers;

[ApiController]
[Route("api/tours")]
public class ToursController : ControllerBase
{
    private static readonly List<Tour> tours = new()
    {
        new Tour { Id = 1, Nombre = "Volcán Arenal", Precio = 25000 },
        new Tour { Id = 2, Nombre = "Monteverde", Precio = 30000 }
    };

    [HttpGet]
    public IActionResult ObtenerTours()
    {
        return Ok(tours);
    }

    [HttpGet("{id}")]
    public IActionResult ObtenerTour(int id)
    {
        var tour = tours.FirstOrDefault(t => t.Id == id);

        if (tour == null)
            return NotFound(new { mensaje = "Tour no encontrado" });

        return Ok(tour);
    }
}

public class Tour
{
    public int Id { get; set; }
    public string Nombre { get; set; } = "";
    public decimal Precio { get; set; }
}