using System.Data;
using Npgsql;

namespace DB;

public class NpgsqlDbConnectionFactory : IdbConnectionFactory
{
    private readonly string _connectionString;

    public NpgsqlDbConnectionFactory(string connectionString)
    {
        _connectionString = connectionString;
    }

    public async Task<IDbConnection> CreateConnectionAsync(CancellationToken cancellationToken)
    {
        var connection = new NpgsqlConnection(_connectionString);
        
        await connection.OpenAsync(cancellationToken);

        return connection;
    }
}

public interface IdbConnectionFactory
{
    Task<IDbConnection> CreateConnectionAsync(CancellationToken cancellationToken);
}