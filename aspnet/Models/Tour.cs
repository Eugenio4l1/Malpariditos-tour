using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace aspnet.Models;

[Table("tours")]
public class Tour
{
    [Key]
    public int Id { get; set; }

    [Required]
    [Column("categoria_id")]
    public int CategoriaId { get; set; }

    [Required, MaxLength(150)]
    [Column("nombre")]
    public string Nombre { get; set; } = "";

    [MaxLength(2000)]
    [Column("descripcion")]
    public string? Descripcion { get; set; }

    [Required]
    [Column("precio", TypeName = "decimal(10,2)")]
    public decimal Precio { get; set; }

    [Required]
    [Column("duracion_horas")]
    public int DuracionHoras { get; set; }

    [Required, MaxLength(30)]
    [Column("estado")]
    public string Estado { get; set; } = "activo";

    [Column("created_at")]
    public DateTime? CreatedAt { get; set; }

    [Column("updated_at")]
    public DateTime? UpdatedAt { get; set; }

    [ForeignKey(nameof(CategoriaId))]
    public Categoria? Categoria { get; set; }

    public ICollection<SalidaTour> SalidaTours { get; set; } =
        new List<SalidaTour>();
}