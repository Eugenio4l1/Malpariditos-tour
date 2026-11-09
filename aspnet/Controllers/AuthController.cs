
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.ComponentModel.DataAnnotations;
using aspnet.Data;

namespace aspnet.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IConfiguration _configuration;

    public AuthController(
        AppDbContext context,
        IConfiguration configuration)
    {
        _context = context;
        _configuration = configuration;
    }

    // POST: /api/auth/login
    [AllowAnonymous]
    [HttpPost("login")]
    public async Task<IActionResult> Login(
        [FromBody] LoginRequest request)
    {
        var usuario = await _context.Usuarios
            .FirstOrDefaultAsync(u => u.Email == request.Email);

        if (usuario == null ||
            !BCrypt.Net.BCrypt.Verify(
                request.Password,
                usuario.Password))
        {
            return Unauthorized(new
            {
                mensaje = "Las credenciales proporcionadas no son válidas.",
                codigo = "CREDENCIALES_INVALIDAS"
            });
        }

        var jwtKey = _configuration["Jwt:Key"]
            ?? "MalpariditosToursClaveSegura2026_Mae123!";

        var key = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(jwtKey));

        var credentials = new SigningCredentials(
            key,
            SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(
                ClaimTypes.NameIdentifier,
                usuario.Id.ToString()),

            new Claim(
                ClaimTypes.Name,
                usuario.Nombre),

            new Claim(
                ClaimTypes.Email,
                usuario.Email),

            new Claim(
                ClaimTypes.Role,
                usuario.Role)
        };

        var token = new JwtSecurityToken(
            claims: claims,
            expires: DateTime.UtcNow.AddHours(8),
            signingCredentials: credentials);

        var tokenGenerado =
            new JwtSecurityTokenHandler().WriteToken(token);

        return Ok(new
        {
            mensaje = "Inicio de sesión exitoso.",
            data = new
            {
                usuario = new
                {
                    id = usuario.Id,
                    name = usuario.Nombre,
                    email = usuario.Email,
                    role = usuario.Role
                },
                token = tokenGenerado
            }
        });
    }
}

public class LoginRequest
{
    [Required]
    [EmailAddress]
    public string Email { get; set; } = "";

    [Required]
    public string Password { get; set; } = "";
}
