export type SavedPasswordDto = {
    PasswordId?: string
    Name: string
    Login: string
    SecondLogin?: string | null
    Password: string
    Url?: string | null
    Notes?: string | null
    Tags?: string[]
    IsFavourite?: boolean
    CreatedAt?: string
    UpdatedAt?: string
}

export type ImportExportPasswordDto = {
    domain: string
    login: string
    secondLogin?: string | null
    note: string
    title: string
    password: string
    tags?: string[]
}

export type ImportExportDto = {
    AUTHENTIFIANT: ImportExportPasswordDto[]
}
