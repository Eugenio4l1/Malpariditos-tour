using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace aspnet.Models;

[Table("salida_tours")]
public class SalidaTour
{
    [Key]
    public int Id { get; set; }

    [Required]
    [Column("tour_id")]
    public int TourId { get; set; }

    [Required]
    [Column("fecha")]
    public DateTime Fecha { get; set; }

    [Required]
    [Column("hora")]
    public TimeSpan Hora { get; set; }

    [Required]
    [Column("cupo_maximo")]
    public int CupoMaximo { get; set; }

    [Required, MaxLength(30)]
    [Column("estado")]
    public string Estado { get; set; } = "";

    [Column("created_at")]
    public DateTime? CreatedAt { get; set; }

    [Column("updated_at")]
    public DateTime? UpdatedAt { get; set; }

    [ForeignKey(nameof(TourId))]
    public Tour? Tour { get; set; }
    
    public ICollection<Reserva> Reservas { get; set; } =
    new List<Reserva>();
}