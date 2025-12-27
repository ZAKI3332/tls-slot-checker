/**
 * Simple Cookie Jar for managing session cookies
 */
export class CookieJar {
  constructor() {
    this.cookies = new Map();
  }

  /**
   * Parse and store a Set-Cookie header
   */
  setCookie(cookieString) {
    try {
      const parts = cookieString.split(';')[0].split('=');
      const name = parts[0].trim();
      const value = parts.slice(1).join('=').trim();
      
      if (name && value) {
        this.cookies.set(name, value);
      }
    } catch (error) {
      console.error('Error parsing cookie:', error.message);
    }
  }

  /**
   * Get a specific cookie value
   */
  getCookie(name) {
    return this.cookies.get(name);
  }

  /**
   * Get all cookies as a Cookie header string
   */
  getCookieString() {
    const cookieArray = [];
    for (const [name, value] of this.cookies.entries()) {
      cookieArray.push(`${name}=${value}`);
    }
    return cookieArray.join('; ');
  }

  /**
   * Clear all cookies
   */
  clear() {
    this.cookies.clear();
  }

  /**
   * Remove a specific cookie
   */
  removeCookie(name) {
    this.cookies.delete(name);
  }

  /**
   * Check if a cookie exists
   */
  hasCookie(name) {
    return this.cookies.has(name);
  }

  /**
   * Get all cookie names
   */
  getCookieNames() {
    return Array.from(this.cookies.keys());
  }
}
