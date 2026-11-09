using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace aspnet.Models;

[Table("users")]
public class Usuario
{
    [Key]
    public int Id { get; set; }

    [Required, MaxLength(255)]
    [Column("name")]
    public string Nombre { get; set; } = "";

    [Required, MaxLength(255)]
    [Column("email")]
    public string Email { get; set; } = "";

    [Column("email_verified_at")]
    public DateTime? EmailVerifiedAt { get; set; }

    [Required]
    [Column("password")]
    public string Password { get; set; } = "";

    [Column("remember_token")]
    public string? RememberToken { get; set; }

    [Required, MaxLength(20)]
    [Column("role")]
    public string Role { get; set; } = "cliente";

    [Column("created_at")]
    public DateTime? CreatedAt { get; set; }

    [Column("updated_at")]
    public DateTime? UpdatedAt { get; set; }

    public Cliente? Cliente { get; set; }
}