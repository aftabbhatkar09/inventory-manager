import mongoose from "mongoose";

// Thrown for any validation failure a controller should turn into a 400
// instead of falling through to the generic 500 handler.
export class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.status = 400;
  }
}

export const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// Confirms `id` is a real, non-soft-deleted document of `Model` and returns
// it -- used for every foreign-key-shaped field (party, godown, product...)
// so a typo'd or deleted id fails loudly with a clear message instead of
// either crashing with a raw CastError or silently creating a dangling
// reference.
export const assertExists = async (Model, id, label) => {
  if (!id || !isValidObjectId(id)) {
    throw new ValidationError(`Invalid ${label}`);
  }

  const doc = await Model.findById(id);

  if (!doc || doc.isDeleted) {
    throw new ValidationError(`${label} not found`);
  }

  return doc;
};

export const assertPositiveNumber = (value, label) => {
  const num = Number(value);

  if (!Number.isFinite(num) || num <= 0) {
    throw new ValidationError(`${label} must be a positive number`);
  }

  return num;
};

export const assertNonNegativeNumber = (value, label) => {
  const num = Number(value);

  if (!Number.isFinite(num) || num < 0) {
    throw new ValidationError(`${label} must be a non-negative number`);
  }

  return num;
};

export const assertFiniteNumber = (value, label) => {
  const num = Number(value);

  if (!Number.isFinite(num)) {
    throw new ValidationError(`${label} must be a number`);
  }

  return num;
};

export const assertOneOf = (value, allowed, label) => {
  if (!allowed.includes(value)) {
    throw new ValidationError(
      `${label} must be one of: ${allowed.join(", ")}`,
    );
  }

  return value;
};

export const assertMinLength = (value, minLength, label) => {
  if (typeof value !== "string" || value.length < minLength) {
    throw new ValidationError(
      `${label} must be at least ${minLength} characters`,
    );
  }

  return value;
};

// Shared page/limit parsing for every *Paged endpoint -- clamps limit to
// maxLimit so a client can't force an unbounded query with ?limit=999999.
export const parsePagination = (query, { defaultLimit = 10, maxLimit = 100 } = {}) => {
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(
    Math.max(parseInt(query.limit, 10) || defaultLimit, 1),
    maxLimit,
  );

  return { page, limit };
};

// Route this into a controller's catch block so a ValidationError becomes
// a clean 400 and anything unexpected still falls through as a 500.
export const handleControllerError = (res, error, fallbackMessage) => {
  if (error instanceof ValidationError) {
    return res.status(error.status).json({ message: error.message });
  }

  res.status(500).json({ message: fallbackMessage, error: error.message });
};
