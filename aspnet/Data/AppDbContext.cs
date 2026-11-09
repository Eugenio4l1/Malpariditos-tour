using Microsoft.EntityFrameworkCore;
using aspnet.Models;

namespace aspnet.Data;

public class AppDbContext : DbContext
{
    public DbSet<Usuario> Usuarios => Set<Usuario>();
    public DbSet<Cliente> Clientes => Set<Cliente>();

    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    public DbSet<Categoria> Categorias => Set<Categoria>();
    public DbSet<Tour> Tours => Set<Tour>();
    public DbSet<SalidaTour> SalidaTours => Set<SalidaTour>();
    public DbSet<Reserva> Reservas => Set<Reserva>();
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Categoria>()
            .HasMany(c => c.Tours)
            .WithOne(t => t.Categoria)
            .HasForeignKey(t => t.CategoriaId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Tour>()
            .HasIndex(t => t.Nombre)
            .IsUnique();

        modelBuilder.Entity<Tour>()
            .Property(t => t.Precio)
            .HasPrecision(10, 2);

        modelBuilder.Entity<Tour>()
            .HasMany(t => t.SalidaTours)
            .WithOne(s => s.Tour)
            .HasForeignKey(s => s.TourId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Reserva>()
.HasOne(r => r.SalidaTour)
.WithMany(s => s.Reservas)
.HasForeignKey(r => r.SalidaTourId)
.OnDelete(DeleteBehavior.Cascade);

        // Usuario - Cliente: relación uno a uno.
        modelBuilder.Entity<Usuario>()
            .HasOne(u => u.Cliente)
            .WithOne(c => c.Usuario)
            .HasForeignKey<Cliente>(c => c.UserId)
            .IsRequired(false)
            .OnDelete(DeleteBehavior.SetNull);

        // Correo único de los clientes.
        modelBuilder.Entity<Cliente>()
            .HasIndex(c => c.Email)
            .IsUnique();

        // Un usuario solo puede estar vinculado a un cliente.
        modelBuilder.Entity<Cliente>()
            .HasIndex(c => c.UserId)
            .IsUnique();

        // Cliente - Reserva.
        modelBuilder.Entity<Reserva>()
            .HasOne(r => r.Cliente)
            .WithMany(c => c.Reservas)
            .HasForeignKey(r => r.ClienteId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}