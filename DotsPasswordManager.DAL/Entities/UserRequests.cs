using DB.Enums;
using System.ComponentModel.DataAnnotations;

namespace DB;

public class UserRequests
{
    [Key]
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public eUserRequestTypes RequestType { get; set; }
    public DateTime ExpiresAt { get; set; }
    public DateTime? CreatedAt { get; set; }
}

