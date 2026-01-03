{ pkgs, ... }: {
  channel = "stable-23.11";
  
  packages = [
    pkgs.nodejs_20
    pkgs.corepack
    pkgs.openssl
    pkgs.mysql80
  ];

  env = {
    DATABASE_URL = "mysql://root@localhost:3306/llm_council";
  };

  services.mysql = {
    enable = true;
    package = pkgs.mysql80;
  };

  idx = {
    extensions = ["drizzle-team.drizzle-kit-vscode"];
    workspace = {
      onCreate = {
        install = "pnpm install";
        init-db = "mysql -u root -e 'CREATE DATABASE IF NOT EXISTS llm_council;'";
      };
    };
    previews = {
      enable = true;
      previews = {
        web = {
          # FIX: Do not define 'port' here (it causes the crash).
          # Instead, we pass the $PORT variable into the command.
          command = [
            "sh"
            "-c"
            "cd client && npm run dev -- --port $PORT --host 0.0.0.0"
          ];
          manager = "web";
        };
      };
    };
  };
}