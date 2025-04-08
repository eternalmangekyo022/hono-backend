import { describe, it, expect } from 'bun:test';
import ax from 'axios';

const axios = (withCookie = false) => {
  return ax.create({
    baseURL: 'http://localhost:3000/',
    headers: withCookie
      ? {
          cookie:
            'refresh=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTJ9.Y4AR06xR2lTcjl6L0C_vDuOc7o4k4g--zwj2bnIlmcs;access=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTIsImhhaGEiOiJzdHJpbmcifQ.zc4OBKYuy-H0oOZPRLejQloa19I0uKofY92X0AaB_U4',
        }
      : {},
  });
};

describe('auth test', async () => {
  it('should auth', async () => {
    const { status } = await axios(true).patch('/auth/users/12', {
      firstName: 'byaaa',
    });
    expect(status).toBe(200);
  });

  it('should not auth', async () => {
    try {
      await axios(false).patch('/auth/users/12', {
        firstName: 'byaaa',
      });
    } catch (e) {
      expect((e as { status: number }).status).toBe(401);
    }
  });
});
