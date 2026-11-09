using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace aspnet.Models;

[Table("reservas")]
public class Reserva
{
    [Key]
    public int Id { get; set; }

    [Required]
    [Column("cliente_id")]
    public int ClienteId { get; set; }

    [Required]
    [Column("salida_tour_id")]
    public int SalidaTourId { get; set; }

    [Required]
    [Range(1, 20)]
    [Column("cantidad_personas")]
    public int CantidadPersonas { get; set; }

    [Required]
    [Column("fecha_reserva")]
    public DateTime FechaReserva { get; set; }

    [Required, MaxLength(30)]
    [Column("estado")]
    public string Estado { get; set; } = "pendiente";

    [Required]
    [Column("total", TypeName = "decimal(10,2)")]
    public decimal Total { get; set; }

    [Column("created_at")]
    public DateTime? CreatedAt { get; set; }

    [Column("updated_at")]
    public DateTime? UpdatedAt { get; set; }

    [ForeignKey(nameof(SalidaTourId))]
    public SalidaTour? SalidaTour { get; set; }

    [ForeignKey(nameof(ClienteId))]
    public Cliente? Cliente { get; set; }
}