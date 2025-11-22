/**
 * PropertiesParser - Java Properties File Parser for TypeScript
 * Handles parsing of .properties files with support for:
 * - Key-value pairs with = separator
 * - Comments starting with #
 * - Line continuations with backslash
 * - Unicode escapes like \u2019
 * - Empty lines and whitespace handling
 */

export class PropertiesParser {

  /**
   * Parse properties content string into key-value map
   */
  public static parse(content: string): Map<string, string> {
    const properties = new Map<string, string>();

    if (!content) {
      return properties;
    }

    const lines = content.split('\n');
    let currentKey = '';
    let currentValue = '';
    let isMultiLine = false;

    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];

      // Remove carriage return if present
      if (line.endsWith('\r')) {
        line = line.slice(0, -1);
      }

      // Skip empty lines and whitespace-only lines
      const trimmedLine = line.trim();
      if (trimmedLine.length === 0) {
        continue;
      }

      // Skip comments (lines starting with # or !)
      if (trimmedLine.startsWith('#') || trimmedLine.startsWith('!') || trimmedLine.startsWith('--')) {
        continue;
      }

      // Skip lines that are just quotes or special characters
      if (trimmedLine === '"' || trimmedLine === "'" || trimmedLine.match(/^[^\w\s]*$/)) {
        continue;
      }

      // Handle line continuation
      if (isMultiLine) {
        // Remove leading whitespace from continuation line
        const continuationValue = line.trim();

        // Check if this line also continues
        if (continuationValue.endsWith('\\')) {
          currentValue += continuationValue.slice(0, -1);
          // Continue to next line
        } else {
          currentValue += continuationValue;
          // Process the complete key-value pair
          properties.set(currentKey, this.unescapeValue(currentValue));
          isMultiLine = false;
          currentKey = '';
          currentValue = '';
        }
        continue;
      }

      // Find the separator (= or :)
      const separatorIndex = this.findSeparator(line);
      if (separatorIndex === -1) {
        // Check if this looks like a key without value (common in properties files)
        if (trimmedLine.length > 0 &&
            !trimmedLine.startsWith('#') &&
            !trimmedLine.startsWith('!') &&
            !trimmedLine.startsWith('--') &&
            trimmedLine.match(/^[A-Za-z_][A-Za-z0-9_.-]*$/)) {
          // Treat as key with empty value (some properties files use this pattern for placeholders)
          properties.set(trimmedLine, '');
        }
        // Silently skip malformed lines instead of warning
        continue;
      }

      // Extract key and value
      const key = line.substring(0, separatorIndex).trim();
      let value = line.substring(separatorIndex + 1).trim();

      if (key.length === 0) {
        console.debug(`PropertiesParser: Empty key in line: ${line}`);
        continue;
      }

      // Check if value continues on next line
      if (value.endsWith('\\')) {
        currentKey = key;
        currentValue = value.slice(0, -1); // Remove the backslash
        isMultiLine = true;
      } else {
        // Complete key-value pair on single line
        properties.set(key, this.unescapeValue(value));
      }
    }

    // Handle case where file ends with a multiline value
    if (isMultiLine && currentKey) {
      properties.set(currentKey, this.unescapeValue(currentValue));
    }

    return properties;
  }

  /**
   * Find the first separator (= or :) that's not escaped
   */
  private static findSeparator(line: string): number {
    for (let i = 0; i < line.length; i++) {
      const char = line.charAt(i);

      if (char === '=' || char === ':') {
        // Check if it's escaped
        let backslashCount = 0;
        let j = i - 1;
        while (j >= 0 && line.charAt(j) === '\\') {
          backslashCount++;
          j--;
        }

        // If even number of backslashes (or zero), separator is not escaped
        if (backslashCount % 2 === 0) {
          return i;
        }
      }
    }

    return -1;
  }

  /**
   * Unescape special characters in property values
   */
  private static unescapeValue(value: string): string {
    if (!value) {
      return value;
    }

    return value
      // Unicode escapes like \u2019
      .replace(/\\u([0-9a-fA-F]{4})/g, (match, hex) => {
        return String.fromCharCode(parseInt(hex, 16));
      })
      // Standard escape sequences
      .replace(/\\n/g, '\n')
      .replace(/\\r/g, '\r')
      .replace(/\\t/g, '\t')
      .replace(/\\f/g, '\f')
      .replace(/\\b/g, '\b')
      // Escaped backslash
      .replace(/\\\\/g, '\\')
      // Escaped equals and colons
      .replace(/\\=/g, '=')
      .replace(/\\:/g, ':')
      // Escaped spaces at beginning/end
      .replace(/^\\ /, ' ')
      .replace(/\\ $/, ' ');
  }

  /**
   * Load and parse properties file from URL with proper encoding handling
   */
  public static async loadFromUrl(url: string): Promise<Map<string, string>> {
    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Failed to load properties file: ${response.status} ${response.statusText}`);
      }

      // Get the raw bytes first
      const arrayBuffer = await response.arrayBuffer();

      // Try to decode as UTF-8 first, then fallback to Latin-1 (ISO-8859-1)
      let content: string;
      try {
        content = new TextDecoder('utf-8', { fatal: true }).decode(arrayBuffer);
      } catch (utfError) {
        console.log(`PropertiesParser: UTF-8 decode failed for ${url}, trying Latin-1`);
        content = new TextDecoder('iso-8859-1').decode(arrayBuffer);
      }

      return this.parse(content);
    } catch (error) {
      console.error(`PropertiesParser: Error loading ${url}:`, error);
      throw error;
    }
  }

  /**
   * Convert properties map back to string format (for debugging/testing)
   */
  public static stringify(properties: Map<string, string>): string {
    const lines: string[] = [];

    for (const [key, value] of properties) {
      const escapedValue = this.escapeValue(value);
      lines.push(`${key}=${escapedValue}`);
    }

    return lines.join('\n');
  }

  /**
   * Escape special characters for property values
   */
  private static escapeValue(value: string): string {
    if (!value) {
      return value;
    }

    return value
      .replace(/\\/g, '\\\\') // Escape backslashes first
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r')
      .replace(/\t/g, '\\t')
      .replace(/\f/g, '\\f')
      .replace(/\b/g, '\\b')
      .replace(/=/g, '\\=')
      .replace(/:/g, '\\:')
      // Escape leading/trailing spaces
      .replace(/^ /, '\\ ')
      .replace(/ $/, '\\ ');
  }
}