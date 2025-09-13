describe('Auth Service - Basic Tests', () => {
  it('should pass a basic test', () => {
    expect(1 + 1).toBe(2);
  });

  it('should have JWT_SECRET configured', () => {
    expect(process.env.JWT_SECRET).toBeDefined();
    expect(typeof process.env.JWT_SECRET).toBe('string');
    expect(process.env.JWT_SECRET!.length).toBeGreaterThan(0);
  });

  it('should have JWT_REFRESH_SECRET configured', () => {
    expect(process.env.JWT_REFRESH_SECRET).toBeDefined();
    expect(typeof process.env.JWT_REFRESH_SECRET).toBe('string');
    expect(process.env.JWT_REFRESH_SECRET!.length).toBeGreaterThan(0);
  });
});
