{ pkgs ? import <nixpkgs> {}
}:
pkgs.mkShell {
  name = "login_form-environment";
  buildInputs = [
    pkgs.glibcLocales
    pkgs.nodejs-14_x
    pkgs.postgresql_13
    pkgs.pgcli
  ];
  shellHook = ''
    export PGHOST=/tmp
    export PGDATA=./db/content
    export PGDATABASE=login_form
    export PGPORT=5454
    export PGSSLMODE=disable
  '';
}
