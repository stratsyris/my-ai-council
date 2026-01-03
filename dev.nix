{ pkgs, ... }: {
  packages = [
    pkgs.nodejs_20
    pkgs.corepack
    pkgs.openssl
    pkgs.mysql80
  ];
  services.mysql.enable = true;
  env.DATABASE_URL = "mysql://root@localhost:3306/llm_council";
  hooks.onCreate = ''
    pnpm install
  '';
}
