-- CreateEnum
CREATE TYPE "RolConsultante" AS ENUM ('CABINA', 'RECEPCION', 'PRESTADORA');

-- CreateEnum
CREATE TYPE "TipoSituacion" AS ENUM ('AGENDA', 'PRODUCTO_PROMOCION', 'PROTOCOLO', 'CONFLICTO', 'PERMISO_TURNO', 'OTRO');

-- CreateEnum
CREATE TYPE "Destinatario" AS ENUM ('PROPIETARIA', 'ADMINISTRADORA', 'SECRETARIA', 'RECEPCION', 'COLABORADORA_ANTIGUA');

-- CreateEnum
CREATE TYPE "Decisor" AS ENUM ('ROL_DELEGADO', 'PROPIETARIA');

-- CreateEnum
CREATE TYPE "TiempoRespuesta" AS ENUM ('MISMO_DIA', 'MENOS_24H', 'MAS_24H', 'SIN_RESPUESTA');

-- CreateEnum
CREATE TYPE "MotivoEscalamiento" AS ENUM ('NO_CORRESPONDIA', 'ROL_PREFIRIO_NO_DECIDIR', 'PIDIO_HABLAR_CON_DUENA', 'OTRO');

-- CreateEnum
CREATE TYPE "CategoriaSugerencia" AS ENUM ('CABINA', 'AGENDA', 'INSUMOS', 'PROTOCOLOS', 'OTRO');

-- CreateEnum
CREATE TYPE "EstadoSugerencia" AS ENUM ('RECIBIDA', 'EN_REVISION', 'IMPLEMENTADA', 'NO_IMPLEMENTADA');

-- CreateEnum
CREATE TYPE "ColorSemaforo" AS ENUM ('VERDE', 'AMARILLO', 'ROJO');

-- CreateEnum
CREATE TYPE "MotivoAviso" AS ENUM ('RETRASO_PACIENTE', 'REPROGRAMACION', 'CABINA_OCUPADA', 'OTRO');

-- CreateEnum
CREATE TYPE "ResultadoMediacion" AS ENUM ('EN_CURSO', 'ACUERDO', 'SIN_ACUERDO_ESCALADA');

-- CreateTable
CREATE TABLE "Consulta" (
    "id" TEXT NOT NULL,
    "abiertaEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cerradaEn" TIMESTAMP(3),
    "quienConsulta" "RolConsultante" NOT NULL,
    "tipo" "TipoSituacion" NOT NULL,
    "dirigidaA" "Destinatario" NOT NULL,
    "recibioRespuesta" BOOLEAN,
    "tiempoRespuesta" "TiempoRespuesta",
    "decidio" "Decisor",
    "escalada" BOOLEAN NOT NULL DEFAULT false,
    "motivoEscalamiento" "MotivoEscalamiento",
    "revertida" BOOLEAN NOT NULL DEFAULT false,
    "revertidaPor" "Destinatario",
    "esDemo" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Consulta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sugerencia" (
    "id" TEXT NOT NULL,
    "fecha" DATE NOT NULL,
    "categoria" "CategoriaSugerencia" NOT NULL,
    "texto" VARCHAR(800) NOT NULL,
    "firma" VARCHAR(80),
    "estado" "EstadoSugerencia" NOT NULL DEFAULT 'RECIBIDA',
    "resumenPublico" VARCHAR(200),
    "respuesta" VARCHAR(800),
    "respondidaEn" DATE,
    "publicada" BOOLEAN NOT NULL DEFAULT false,
    "esDemo" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Sugerencia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AvisoAgenda" (
    "id" TEXT NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "color" "ColorSemaforo" NOT NULL,
    "motivo" "MotivoAviso" NOT NULL,
    "minutosRetraso" INTEGER,
    "minutosAnticipacion" INTEGER NOT NULL,
    "esDemo" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "AvisoAgenda_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RespuestaPulso" (
    "id" TEXT NOT NULL,
    "semana" TEXT NOT NULL,
    "fecha" DATE NOT NULL,
    "p1" INTEGER NOT NULL,
    "p2" INTEGER NOT NULL,
    "p3" INTEGER NOT NULL,
    "p4" INTEGER NOT NULL,
    "p5" INTEGER NOT NULL,
    "p6" INTEGER NOT NULL,
    "esDemo" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "RespuestaPulso_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RespuestaPulsoRoles" (
    "id" TEXT NOT NULL,
    "semana" TEXT NOT NULL,
    "fecha" DATE NOT NULL,
    "p7" INTEGER NOT NULL,
    "esDemo" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "RespuestaPulsoRoles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActaCirculo" (
    "id" TEXT NOT NULL,
    "fecha" DATE NOT NULL,
    "funciono" VARCHAR(300) NOT NULL,
    "seTrabo" VARCHAR(300) NOT NULL,
    "carga" VARCHAR(300) NOT NULL,
    "acordamos" VARCHAR(300) NOT NULL,
    "esDemo" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ActaCirculo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Mediacion" (
    "id" TEXT NOT NULL,
    "fecha" DATE NOT NULL,
    "resultado" "ResultadoMediacion" NOT NULL DEFAULT 'EN_CURSO',
    "seguimientoHecho" BOOLEAN NOT NULL DEFAULT false,
    "esDemo" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Mediacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SituacionMapa" (
    "id" TEXT NOT NULL,
    "orden" INTEGER NOT NULL,
    "titulo" VARCHAR(120) NOT NULL,
    "ejemplo" VARCHAR(300) NOT NULL,
    "tipo" "TipoSituacion" NOT NULL,
    "quienResuelve" VARCHAR(120) NOT NULL,
    "tiempoEsperado" VARCHAR(80) NOT NULL,
    "cuandoEscalar" VARCHAR(300) NOT NULL,
    "comoHacerlo" VARCHAR(300),
    "porValidar" BOOLEAN NOT NULL DEFAULT true,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SituacionMapa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ajuste" (
    "clave" TEXT NOT NULL,
    "valor" TEXT NOT NULL,

    CONSTRAINT "Ajuste_pkey" PRIMARY KEY ("clave")
);

-- CreateIndex
CREATE INDEX "Consulta_abiertaEn_idx" ON "Consulta"("abiertaEn");

-- CreateIndex
CREATE INDEX "Sugerencia_fecha_idx" ON "Sugerencia"("fecha");

-- CreateIndex
CREATE INDEX "AvisoAgenda_creadoEn_idx" ON "AvisoAgenda"("creadoEn");

-- CreateIndex
CREATE INDEX "RespuestaPulso_semana_idx" ON "RespuestaPulso"("semana");
