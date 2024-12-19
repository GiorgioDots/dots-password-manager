FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
USER $APP_UID
WORKDIR /app
EXPOSE 8080
EXPOSE 8081

FROM node:22.12.0-alpine AS client-build
WORKDIR /app/client
COPY DotsPasswordManager-client/package*.json ./
RUN npm install
COPY DotsPasswordManager-client/ .
RUN npm run build-prod
RUN ls

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src
COPY ["DotsPasswordManager.Web.Api/DotsPasswordManager.Web.Api.csproj", "DotsPasswordManager.Web.Api/"]
RUN dotnet restore "DotsPasswordManager.Web.Api/DotsPasswordManager.Web.Api.csproj"
COPY . .
WORKDIR "/src/DotsPasswordManager.Web.Api"
RUN dotnet build "DotsPasswordManager.Web.Api.csproj" -c $BUILD_CONFIGURATION -o /app/build

FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "DotsPasswordManager.Web.Api.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
COPY --from=client-build /app/client/dist/client ./client
ENTRYPOINT ["dotnet", "DotsPasswordManager.Web.Api.dll"]
