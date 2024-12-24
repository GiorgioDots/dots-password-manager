using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DB;
public  class DPMDbContext(DbContextOptions<DPMDbContext> options) : DbContext(options)
{
    public DbSet<RefreshToken> RefreshTokens { get; set; }
    public DbSet<User> Users { get; set; }
    public DbSet<SavedPassword> SavedPasswords { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Enforce lowercase table and column names
        foreach (var entity in modelBuilder.Model.GetEntityTypes())
        {
            // Convert table names to lowercase
            entity.SetTableName(entity.GetTableName()?.ToLower());

            // Convert column names to lowercase
            foreach (var property in entity.GetProperties())
            {
                property.SetColumnName(property.GetColumnName(StoreObjectIdentifier.Table(entity.GetTableName() ?? "", null))?.ToLower());
            }

            // Convert key names to lowercase
            foreach (var key in entity.GetKeys())
            {
                key.SetName(key.GetName()?.ToLower());
            }

            // Convert index names to lowercase
            foreach (var index in entity.GetIndexes())
            {
                index.SetDatabaseName(index.GetDatabaseName()?.ToLower());
            }
        }
    }
}
