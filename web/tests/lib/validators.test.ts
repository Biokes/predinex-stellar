import { describe, it, expect } from 'vitest';
import {
  validateContractId,
  validateDuration,
  MIN_POOL_DURATION_SECS,
  MAX_POOL_DURATION_SECS,
} from '../../app/lib/validators';

describe('validateContractId', () => {
  describe('valid identifiers', () => {
    it('accepts a valid mainnet contract identifier', () => {
      const result = validateContractId(
        'SPENV2J0V4BHRFAZ6FVF97K9ZGQJ0GT19RC3JFN7.predinex-pool',
        'mainnet'
      );
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('accepts a valid testnet contract identifier', () => {
      const result = validateContractId(
        'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.predinex-pool',
        'testnet'
      );
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('accepts an SM-prefixed mainnet address', () => {
      const result = validateContractId(
        'SM2WWKKF25SED3K5P6ETY7MDDNBQH50GPSP8EJM8N.my-contract',
        'mainnet'
      );
      expect(result.valid).toBe(true);
    });

    it('accepts an SN-prefixed testnet address', () => {
      const result = validateContractId(
        'SN2WWKKF25SED3K5P6ETY7MDDNBQH50GPSP8EJM8N.my-contract',
        'testnet'
      );
      expect(result.valid).toBe(true);
    });
  });

  describe('missing or empty input', () => {
    it('rejects an empty string', () => {
      const result = validateContractId('', 'testnet');
      expect(result.valid).toBe(false);
      expect(result.error).toMatch(/required/i);
    });

    it('rejects a whitespace-only string', () => {
      const result = validateContractId('   ', 'testnet');
      expect(result.valid).toBe(false);
      expect(result.error).toMatch(/required/i);
    });
  });

  describe('malformed identifiers', () => {
    it('rejects an identifier without a dot separator', () => {
      const result = validateContractId('ST1PQHQKV0RJXZFY1DGX8MNSNYVEpredinex', 'testnet');
      expect(result.valid).toBe(false);
      expect(result.error).toMatch(/address.*contractName/i);
    });

    it('rejects an identifier with a leading dot', () => {
      const result = validateContractId('.predinex-pool', 'testnet');
      expect(result.valid).toBe(false);
      expect(result.error).toMatch(/address.*contractName/i);
    });

    it('rejects an identifier with a trailing dot', () => {
      const result = validateContractId('ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.', 'testnet');
      expect(result.valid).toBe(false);
      expect(result.error).toMatch(/address.*contractName/i);
    });

    it('rejects an address that is too short', () => {
      const result = validateContractId('STSHORT.predinex-pool', 'testnet');
      expect(result.valid).toBe(false);
      expect(result.error).toMatch(/invalid contract address/i);
    });

    it('rejects a contract name with uppercase letters', () => {
      const result = validateContractId(
        'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.Predinex-Pool',
        'testnet'
      );
      expect(result.valid).toBe(false);
      expect(result.error).toMatch(/invalid contract name/i);
    });

    it('rejects a contract name starting with a digit', () => {
      const result = validateContractId(
        'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.1bad-name',
        'testnet'
      );
      expect(result.valid).toBe(false);
      expect(result.error).toMatch(/invalid contract name/i);
    });
  });

  describe('network mismatch', () => {
    it('rejects a testnet address when network is mainnet', () => {
      const result = validateContractId(
        'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.predinex-pool',
        'mainnet'
      );
      expect(result.valid).toBe(false);
      expect(result.error).toMatch(/testnet address/i);
      expect(result.error).toMatch(/NEXT_PUBLIC_NETWORK/);
    });

    it('rejects a mainnet address when network is testnet', () => {
      const result = validateContractId(
        'SPENV2J0V4BHRFAZ6FVF97K9ZGQJ0GT19RC3JFN7.predinex-pool',
        'testnet'
      );
      expect(result.valid).toBe(false);
      expect(result.error).toMatch(/mainnet address/i);
      expect(result.error).toMatch(/NEXT_PUBLIC_NETWORK/);
    });

    it('includes the correct prefix hint in the error message', () => {
      const result = validateContractId(
        'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.predinex-pool',
        'mainnet'
      );
      expect(result.error).toContain('SP');
    });
  });
});

describe('validateDuration (issue #151)', () => {
  it('exposes the contract minimum as 300 seconds', () => {
    expect(MIN_POOL_DURATION_SECS).toBe(300);
  });

  it('rejects 0 with a "greater than 0" error', () => {
    const result = validateDuration(0);
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/greater than 0/i);
  });

  it('rejects a negative duration', () => {
    const result = validateDuration(-1);
    expect(result.valid).toBe(false);
  });

  it('rejects a duration just below the contract minimum', () => {
    const result = validateDuration(MIN_POOL_DURATION_SECS - 1);
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/at least 300 seconds/i);
  });

  it('accepts a duration exactly at the contract minimum', () => {
    const result = validateDuration(MIN_POOL_DURATION_SECS);
    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it('accepts a typical duration well above the minimum', () => {
    const result = validateDuration(3600);
    expect(result.valid).toBe(true);
  });

  it('rejects a duration above the soft upper bound', () => {
    const result = validateDuration(MAX_POOL_DURATION_SECS + 1);
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/less than/i);
  });

  it('accepts a duration exactly at the upper bound', () => {
    const result = validateDuration(MAX_POOL_DURATION_SECS);
    expect(result.valid).toBe(true);
  });
});
