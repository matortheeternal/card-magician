import CardMagicianCardValue from './domain/card/CardMagicianCard.js';
import CardMagicianProjectValue from './domain/projects/CardMagicianProject.js';

export type { Field } from './domain/template/CardMagicianModule.js';
export type { default as ExportArtifact } from './domain/export/ExportArtifact.js';
export type { OutputItem } from './domain/export/CardMagicianExporter.js';
export type { CollectionOptions } from './shared/storage/CollectionManager.js';
export type { default as CollectionManager } from './shared/storage/CollectionManager.js';
export type GameMetadata = { path: string; id: string; version: string };
export type CardMagicianCardConstructor = typeof CardMagicianCardValue;
export type CardMagicianProjectConstructor = typeof CardMagicianProjectValue;
export type ExporterConfig = Record<string, unknown>;
export type ExporterMetadata = {
    id: string;
    path: string;
    version: string;
    folder?: string;
    dependencies?: string[];
};
export { default as CardMagicianCard } from './domain/card/CardMagicianCard.js';
export type card = CardMagicianCardValue;
export { default as Modal } from './ui/modals/Modal.js';
export { default as ReactiveComponent } from './ui/components/ReactiveComponent.js';
export type { default as CardFaceModel } from './domain/card/CardFaceModel.js';
export type { default as CardMagicianSettings } from './ui/settings/CardMagicianSettings.js';
export type { default as Serializer } from './domain/projects/serializers/Serializer.js';
export type { default as SerializerAdapter } from './domain/projects/adapters/SerializerAdapter.js';
export type { default as MountedDirectory } from './shared/MountedDirectory.js';
export type { default as ImageOp } from './domain/graphics/ImageOp.js';
export type { default as DOMBuilder } from './domain/card/DomBuilder.js';
export type Column = Record<string, unknown>;
export { default as CardMagicianGame } from './domain/game/CardMagicianGame.js';
export { default as StatisticsRegistry } from './domain/statistics/StatisticsRegistry.js';
export type {
    Category, StatisticsDimension, StatisticsField, StatisticsMeasure,
    ChartDefinition, ChartRenderer, ChartRendererInstance, StatisticsContext
} from './statistics.js';
export { default as CardMagicianProject } from './domain/projects/CardMagicianProject.js';
export { default as CardMagicianModule } from './domain/template/CardMagicianModule.js';
export { default as CardMagicianExporter } from './domain/export/CardMagicianExporter.js';

export type AppEnvironment = Readonly<{
    id: string;
    version: string;
    runtimeVersion: string;
    isDevelopment: boolean;
    resourceMode: 'bundle' | 'directory';
    args: readonly string[];
    paths: Readonly<{
        extensions: string;
        content: string;
        data: string;
    }>;
}>;

export type EditorCard = {
    front?: import('./domain/card/CardFaceModel.js').default;
    back?: import('./domain/card/CardFaceModel.js').default;
    [key: string]: unknown;
};

export type Localize = (namespace: string) => (
    strings: TemplateStringsArray, ...values: unknown[]
) => string;

export type Logger = {
    debug(message: unknown, ...args: unknown[]): void;
    info(message: unknown, ...args: unknown[]): void;
    warn(message: unknown, ...args: unknown[]): void;
    error(message: unknown, ...args: unknown[]): void;
};

export type Log = (group: string) => Logger;
export type Reporter = (id: string, error: unknown, data?: unknown) => void;
export type CreateReporter = (context: Record<string, unknown>) => Reporter;
export type Changed = (object: object, paths?: string | string[] | null) => void;

export type DialogOptions = {
    title?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    defaultValue?: string;
};

export type DialogService = {
    readonly isOpen: boolean;
    alert(message: string, options?: DialogOptions): Promise<void>;
    confirm(message: string, options?: DialogOptions): Promise<boolean>;
    prompt(message: string, options?: DialogOptions): Promise<string | null>;
};
export type { DirectoryEntry, FileStats, PathParts } from './platforms/PlatformAdapter.js';
