/** Egyptian mobile: 010/011/012/015 local, or +20 / 0020 / 20 prefix. */
export const EGYPTIAN_PHONE_REGEX = /^(\+20|0020|20)?0?1[0125][0-9]{8}$/;

export const EGYPTIAN_PHONE_MESSAGE =
  "Invalid Egyptian phone number (must start with 010, 011, 012, or 015)";
