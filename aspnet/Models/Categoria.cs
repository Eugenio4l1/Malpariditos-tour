using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace aspnet.Models;

[Table("categorias")]
public class Categoria
{
    [Key]
    public int Id { get; set; }

    [Required, MaxLength(100)]
    [Column("nombre")]
    public string Nombre { get; set; } = "";

    [MaxLength(255)]
    [Column("descripcion")]
    public string? Descripcion { get; set; }

    [Column("created_at")]
    public DateTime? CreatedAt { get; set; }

    [Column("updated_at")]
    public DateTime? UpdatedAt { get; set; }

    public ICollection<Tour> Tours { get; set; } = new List<Tour>();
}