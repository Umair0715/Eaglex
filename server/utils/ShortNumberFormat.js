function shortNumberFormat(number) {
    const suffixes = ['', 'k', 'M', 'B', 'T'];
    const precision = 0;
  
    // Handle special cases
    if (number < 1000) {
        return number.toFixed();
    }
    if (number >= 1e15) {
        return '∞';
    }
  
    // Determine the appropriate suffix and value
    const exponent = Math.floor(Math.log10(number));
    const suffixIndex = Math.floor(exponent / 3);
    const suffix = suffixes[suffixIndex];
    const value = number / Math.pow(10, suffixIndex * 3);
  
    // Format the value with the appropriate precision and suffix
    return `${value.toFixed(precision)}${suffix}`;
}

module.exports = shortNumberFormat;