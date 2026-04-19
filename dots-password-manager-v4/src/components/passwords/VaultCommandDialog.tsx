import { StarIcon, XIcon } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

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
import { dedupePasswordsById, getCommandItemValue } from '#/lib/shared/passwords/editor'

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

type VaultCommandItemProps = {
    item: SavedPasswordDto
    isFavourite: boolean
    noUrlLabel: string
    toggleFavouriteLabel: string
    onOpenChange: (open: boolean) => void
    onSelectPassword: (id: string) => void
    onToggleFavourite: (id: string) => Promise<void>
}

function VaultCommandItemRow({
    item,
    isFavourite,
    noUrlLabel,
    toggleFavouriteLabel,
    onOpenChange,
    onSelectPassword,
    onToggleFavourite,
}: VaultCommandItemProps) {
    return (
        <CommandItem
            key={item.PasswordId}
            value={getCommandItemValue(item)}
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
                    <span className="truncate font-medium capitalize">{item.Name}</span>
                    <span className="truncate text-xs text-muted-foreground">
                        {item.Url || noUrlLabel}
                    </span>
                </div>
                <button
                    type="button"
                    aria-label={toggleFavouriteLabel}
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
                    className={
                        isFavourite
                            ? 'inline-flex size-7 items-center justify-center rounded-md text-yellow-500 hover:bg-accent'
                            : 'inline-flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-accent'
                    }
                >
                    <StarIcon className={isFavourite ? 'size-4 fill-current' : 'size-4'} />
                </button>
            </div>
        </CommandItem>
    )
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
    const { t } = useTranslation('vault')
    const [search, setSearch] = useState('')
    const favouriteItems = useMemo(
        () => dedupePasswordsById(favouritePasswords),
        [favouritePasswords],
    )
    const otherItems = useMemo(() => dedupePasswordsById(otherPasswords), [otherPasswords])

    return (
        <CommandDialog
            open={open}
            onOpenChange={onOpenChange}
            title={t('dialog_title')}
            description={t('dialog_description')}
            className="top-4 w-[calc(100vw-2rem)] max-w-xl xl:top-1/2 xl:-translate-y-1/2"
        >
            <Command>
                <div className="flex items-center">
                    <CommandInput
                        value={search}
                        onValueChange={setSearch}
                        placeholder={t('dialog_search_placeholder')}
                        wrapperClassName="grow"
                    />
                    <Button
                        variant="ghost"
                        size="icon"
                        type="button"
                        onClick={() => onOpenChange(false)}
                    >
                        <XIcon />
                    </Button>
                </div>
                <CommandList className="max-h-[calc(100dvh-5rem)] md:max-h-[min(50vh,420px)]">
                    <CommandEmpty>{loading ? t('dialog_loading') : t('dialog_empty')}</CommandEmpty>

                    {hasFavourites ? (
                        <CommandGroup heading={t('group_favourites')}>
                            {favouriteItems.map((item) => (
                                <VaultCommandItemRow
                                    key={item.PasswordId}
                                    item={item}
                                    isFavourite={true}
                                    noUrlLabel={t('no_url_fallback')}
                                    toggleFavouriteLabel={t('toggle_favourite_aria')}
                                    onOpenChange={onOpenChange}
                                    onSelectPassword={onSelectPassword}
                                    onToggleFavourite={onToggleFavourite}
                                />
                            ))}
                        </CommandGroup>
                    ) : null}

                    <CommandGroup
                        heading={
                            hasFavourites && otherItems.length > 0
                                ? t('group_all')
                                : t('group_vault')
                        }
                    >
                        {otherItems.map((item) => (
                            <VaultCommandItemRow
                                key={item.PasswordId}
                                item={item}
                                isFavourite={false}
                                noUrlLabel={t('no_url_fallback')}
                                toggleFavouriteLabel={t('toggle_favourite_aria')}
                                onOpenChange={onOpenChange}
                                onSelectPassword={onSelectPassword}
                                onToggleFavourite={onToggleFavourite}
                            />
                        ))}
                    </CommandGroup>
                </CommandList>
            </Command>
        </CommandDialog>
    )
}
