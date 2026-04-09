export function AuthMainContainer({ children }: React.PropsWithChildren) {
    return (
        <div className="h-full flex items-center justify-stretch mx-auto w-full max-w-md px-4 pb-10 pt-12 *:w-full">
            {children}
        </div>
    )
}
