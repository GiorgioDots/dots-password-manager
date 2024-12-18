using Microsoft.EntityFrameworkCore;
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
}
