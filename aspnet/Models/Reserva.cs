using System.ComponentModel.DataAnnotations;

namespace aspnet.Models;

public class Reserva
{
    public int Id { get; set; }

    [Required(ErrorMessage = "El tour es obligatorio")]
    public int TourId { get; set; }

    [Required(ErrorMessage = "El nombre es obligatorio")]
    [StringLength(100, MinimumLength = 3)]
    public string NombreCliente { get; set; } = "";

    [Required]
    [Range(1, 10, ErrorMessage = "Debe reservar entre 1 y 10 personas")]
    public int CantidadPersonas { get; set; }
}