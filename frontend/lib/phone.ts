// US and Canada phone numbers, shown and typed as "(212) 555-0100"

// "2125550100" → "(212) 555-0100". A partial number is formatted as far as it goes, which is how
// the phone field shows it while typing: "21", "(212) ", "(212) 55", "(212) 555-", "(212) 555-01"
function formatPhoneDigits(digits: string) {
  if (digits.length < 3) return digits;
  if (digits.length < 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

function onlyDigits(value: string) {
  return value.replace(/\D/g, "");
}

// a leading 1 on an 11-digit number is the country code, as in "+1 212 555 0100"
function dropCountryCode(digits: string) {
  return digits.length === 11 && digits.startsWith("1")
    ? digits.slice(1)
    : digits;
}

// for display: a 10-digit number saved in any format becomes "(212) 555-0100"; anything else
// (an extension, a number from another country) is returned as it was saved
export function formatPhone(phone: string) {
  const digits = dropCountryCode(onlyDigits(phone));
  return digits.length === 10 ? formatPhoneDigits(digits) : phone;
}

// what the phone field accepts: nothing (the phone is optional) or a full "(212) 555-0100"
export const phoneFieldPattern = /^(\(\d{3}\) \d{3}-\d{4})?$/;

// index just past the nth digit of a formatted value, and past any "(", ")", space or "-" after
// it, so the next digit typed lands after the separator
function caretAfterDigits(formatted: string, n: number) {
  let index = 0;
  for (let seen = 0; index < formatted.length && seen < n; index++) {
    if (/\d/.test(formatted[index])) seen++;
  }
  while (index < formatted.length && /\D/.test(formatted[index])) index++;
  return index;
}

// reformats the phone field after the browser applies an edit (a typed or deleted character,
// a paste) and works out where the caret goes so it stays beside the same digit
export function formatPhoneInput({
  previous,
  value,
  caret,
  inputType,
}: {
  previous: string; // the field's value before the edit
  value: string; // the value with the edit applied
  caret: number; // the caret position after the edit
  inputType?: string; // the native InputEvent's inputType, e.g. "insertText"
}) {
  let digits = onlyDigits(value);
  let digitsBeforeCaret = onlyDigits(value.slice(0, caret)).length;
  const isDeletion = inputType?.startsWith("delete") ?? false;

  // Backspace or Delete removed only a "(", ")", space or "-": remove the digit beside it too,
  // otherwise formatting would put the character straight back and the key would do nothing
  if (
    isDeletion &&
    value.length === previous.length - 1 &&
    digits === onlyDigits(previous)
  ) {
    if (inputType === "deleteContentForward") {
      digits =
        digits.slice(0, digitsBeforeCaret) +
        digits.slice(digitsBeforeCaret + 1);
    } else if (digitsBeforeCaret > 0) {
      digits =
        digits.slice(0, digitsBeforeCaret - 1) +
        digits.slice(digitsBeforeCaret);
      digitsBeforeCaret--;
    }
  }

  // a pasted "+1 212 555 0100"; not for a digit typed into a full field, which would
  // otherwise shift a number like "(123) 456-7890" along
  if (inputType !== "insertText" && dropCountryCode(digits) !== digits) {
    digits = digits.slice(1);
    digitsBeforeCaret = Math.max(0, digitsBeforeCaret - 1);
  }

  if (digits.length > 10) {
    // deleting from an older saved number that is longer, such as one with an extension:
    // leave it unformatted until it fits
    if (isDeletion) return { value, caret };
    // a digit typed into a full field or a paste that's too long: keep the field as it was,
    // like a full field with a maxLength
    return {
      value: previous,
      caret: Math.max(0, caret - (value.length - previous.length)),
    };
  }

  const formatted = formatPhoneDigits(digits);
  return {
    value: formatted,
    caret: caretAfterDigits(formatted, digitsBeforeCaret),
  };
}
