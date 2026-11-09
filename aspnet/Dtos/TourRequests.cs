
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace aspnet.Dtos;

public class CrearTourRequest
{
    [JsonPropertyName("categoria_id")]
    [Required]
    public int CategoriaId { get; set; }

    [JsonPropertyName("nombre")]
    [Required]
    [StringLength(150, MinimumLength = 2)]
    public string Nombre { get; set; } = "";

    [JsonPropertyName("descripcion")]
    [StringLength(2000)]
    public string? Descripcion { get; set; }

    [JsonPropertyName("precio")]
    [Range(0.01, 99999999.99)]
    public decimal Precio { get; set; }

    [JsonPropertyName("duracion_horas")]
    [Range(1, 1000)]
    public int DuracionHoras { get; set; }

    [JsonPropertyName("estado")]
    [Required]
    [RegularExpression("^(activo|inactivo)$")]
    public string Estado { get; set; } = "activo";
}

public class ActualizarTourRequest
{
    [JsonPropertyName("categoria_id")]
    [Range(1, int.MaxValue)]
    public int? CategoriaId { get; set; }

    [JsonPropertyName("nombre")]
    [StringLength(150, MinimumLength = 2)]
    public string? Nombre { get; set; }

    [JsonPropertyName("descripcion")]
    [StringLength(2000)]
    public string? Descripcion { get; set; }

    [JsonPropertyName("precio")]
    [Range(0.01, 99999999.99)]
    public decimal? Precio { get; set; }

    [JsonPropertyName("duracion_horas")]
    [Range(1, 1000)]
    public int? DuracionHoras { get; set; }

    [JsonPropertyName("estado")]
    [RegularExpression("^(activo|inactivo)$")]
    public string? Estado { get; set; }
}

