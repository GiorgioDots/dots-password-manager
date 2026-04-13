import { StarIcon, XIcon } from 'lucide-react'

import { Button } from '#/components/ui/button'
import {
    Command,
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '#/components/ui/command'
import type { SavedPasswordDto } from '#/lib/shared/passwords/contracts'

type VaultCommandDialogProps = {
    open: boolean
    loading: boolean
    hasFavourites: boolean
    favouritePasswords: SavedPasswordDto[]
    otherPasswords: SavedPasswordDto[]
    onOpenChange: (open: boolean) => void
    onSelectPassword: (id: string) => void
    onToggleFavourite: (id: string) => Promise<void>
}

export default function VaultCommandDialog({
    open,
    loading,
    hasFavourites,
    favouritePasswords,
    otherPasswords,
    onOpenChange,
    onSelectPassword,
    onToggleFavourite,
}: VaultCommandDialogProps) {
    return (
        <CommandDialog
            open={open}
            onOpenChange={onOpenChange}
            title="Select a password"
            description="Search your vault and open a password entry."
            className="w-[calc(100vw-2rem)] max-w-xl top-4 xl:top-1/2 xl:-translate-y-1/2"
        >
            <Command>
                <div className="flex items-center">
                    <CommandInput
                        placeholder="Search by name, login or url..."
                        wrapperClassName="grow"
                    />
                    <Button
                        variant={'ghost'}
                        size={'icon'}
                        type="button"
                        onClick={() => onOpenChange(false)}
                    >
                        <XIcon />
                    </Button>
                </div>
                <CommandList className="max-h-[calc(100dvh-5rem)] md:max-h-[min(50vh,420px)]">
                    <CommandEmpty>
                        {loading ? 'Loading passwords...' : 'No passwords found.'}
                    </CommandEmpty>
                    {hasFavourites ? (
                        <CommandGroup heading="Favourites">
                            {favouritePasswords.map((item) => (
                                <CommandItem
                                    key={item.PasswordId}
                                    value={`${item.Name} ${item.Login} ${item.Url ?? ''}`}
                                    onSelect={() => {
                                        if (!item.PasswordId) {
                                            return
                                        }

                                        onOpenChange(false)
                                        onSelectPassword(item.PasswordId)
                                    }}
                                >
                                    <div className="flex w-full items-center justify-between gap-2">
                                        <div className="flex min-w-0 flex-col">
                                            <span className="truncate font-medium capitalize">
                                                {item.Name}
                                            </span>
                                            <span className="truncate text-xs text-muted-foreground">
                                                {item.Url || 'No url'}
                                            </span>
                                        </div>
                                        <button
                                            type="button"
                                            aria-label="Toggle favourite"
                                            onMouseDown={(event) => {
                                                event.preventDefault()
                                                event.stopPropagation()
                                            }}
                                            onClick={(event) => {
                                                event.preventDefault()
                                                event.stopPropagation()
                                                if (item.PasswordId) {
                                                    onToggleFavourite(item.PasswordId).catch(
                                                        () => {},
                                                    )
                                                }
                                            }}
                                            className="inline-flex size-7 items-center justify-center rounded-md text-yellow-500 hover:bg-accent"
                                        >
                                            <StarIcon className="size-4 fill-current" />
                                        </button>
                                    </div>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    ) : null}

                    <CommandGroup
                        heading={
                            hasFavourites && otherPasswords.length > 0 ? 'All passwords' : 'Vault'
                        }
                    >
                        {otherPasswords.map((item) => (
                            <CommandItem
                                key={item.PasswordId}
                                value={`${item.Name} ${item.Login} ${item.Url ?? ''}`}
                                onSelect={() => {
                                    if (!item.PasswordId) {
                                        return
                                    }

                                    onOpenChange(false)
                                    onSelectPassword(item.PasswordId)
                                }}
                            >
                                <div className="flex w-full items-center justify-between gap-2">
                                    <div className="flex min-w-0 flex-col">
                                        <span className="truncate font-medium capitalize">
                                            {item.Name}
                                        </span>
                                        <span className="truncate text-xs text-muted-foreground">
                                            {item.Url || 'No url'}
                                        </span>
                                    </div>
                                    <button
                                        type="button"
                                        aria-label="Toggle favourite"
                                        onMouseDown={(event) => {
                                            event.preventDefault()
                                            event.stopPropagation()
                                        }}
                                        onClick={(event) => {
                                            event.preventDefault()
                                            event.stopPropagation()
                                            if (item.PasswordId) {
                                                onToggleFavourite(item.PasswordId).catch(() => {})
                                            }
                                        }}
                                        className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-accent"
                                    >
                                        <StarIcon className="size-4" />
                                    </button>
                                </div>
                            </CommandItem>
                        ))}
                    </CommandGroup>
                </CommandList>
            </Command>
        </CommandDialog>
    )
}
