namespace User.SavedPassword._DTOs;

public class ImportExportDTO
{
    public ImportExportPasswordDTO[] AUTHENTIFIANT {  get; set; }

    public sealed class Validator : Validator<ImportExportDTO>
    {
        public Validator()
        {
            RuleFor(x => x.AUTHENTIFIANT)
                .NotNull().NotEmpty().WithMessage("The file you imported is not compatible");
        }
    }
}

public class ImportExportPasswordDTO
{
    public string domain { get; set; }
    public string login { get; set; }
    public string? secondLogin { get; set; }
    public string note { get; set; }
    public string title { get; set; }
    public string password { get; set; }
    public string[]? tags { get; set; }
}
