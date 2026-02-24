export interface CacheEnvelope<T> {
  value: T;

  createdAt: number;

  expiresAt: number;
}

export interface KeyValueCacheStore {
  read(key: string): Promise<unknown | null>;

  write(key: string, value: unknown): Promise<void>;
}

export class KeyValueCache<T> {
  private readonly store: KeyValueCacheStore;

  private readonly migrate: ((raw: unknown) => CacheEnvelope<T> | null) | undefined;

  public constructor(opts: {store: KeyValueCacheStore; migrate?: (raw: unknown) => CacheEnvelope<T> | null}) {
    this.store = opts.store;
    this.migrate = opts.migrate;
  }

  public async getEnvelope(key: string): Promise<CacheEnvelope<T> | null> {
    const raw = await this.store.read(key);
    if (!raw) {
      return null;
    }

    const parsed = this.parseEnvelope(raw);
    if (!parsed) {
      return null;
    }

    return parsed;
  }

  public async setEnvelope(key: string, envelope: CacheEnvelope<T>): Promise<void> {
    await this.store.write(key, envelope);
  }

  public isFresh(envelope: CacheEnvelope<T>, now: number): boolean {
    return now < envelope.expiresAt;
  }

  public buildEnvelope(value: T, ttlMs: number, now: number): CacheEnvelope<T> {
    return {
      value,
      createdAt: now,
      expiresAt: now + ttlMs,
    };
  }

  private parseEnvelope(raw: unknown): CacheEnvelope<T> | null {
    if (this.isEnvelopeShape(raw)) {
      return raw;
    }

    if (!this.migrate) {
      return null;
    }

    return this.migrate(raw);
  }

  private isEnvelopeShape(value: unknown): value is CacheEnvelope<T> {
    if (!value || typeof value !== 'object') {
      return false;
    }

    const maybe = value as Record<string, unknown>;
    return (
      'value' in maybe &&
      typeof maybe.createdAt === 'number' &&
      typeof maybe.expiresAt === 'number'
    );
  }
}
