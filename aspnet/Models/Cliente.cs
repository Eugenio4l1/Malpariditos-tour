using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace aspnet.Models;

[Table("clientes")]
public class Cliente
{
    [Key]
    public int Id { get; set; }

    [Column("user_id")]
    public int? UserId { get; set; }

    [Required, MaxLength(100)]
    [Column("nombre")]
    public string Nombre { get; set; } = "";

    [Required, MaxLength(150)]
    [Column("email")]
    public string Email { get; set; } = "";

    [MaxLength(20)]
    [Column("telefono")]
    public string? Telefono { get; set; }

    [Required, MaxLength(255)]
    [Column("password")]
    public string Password { get; set; } = "";

    [Column("created_at")]
    public DateTime? CreatedAt { get; set; }

    [Column("updated_at")]
    public DateTime? UpdatedAt { get; set; }

    public Usuario? Usuario { get; set; }

    public ICollection<Reserva> Reservas { get; set; } =
        new List<Reserva>();
}