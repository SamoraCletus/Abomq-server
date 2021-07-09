module.exports.validatesRegisterInput = (
  username,
  email,
  password,
  confirmPassword,
  age
) => {
  const errors = {};
  if (username.trim() === "") {
    errors.username = "Username must not be empty";
  }
  if (email.trim() === "") {
    errors.email = "Email must not be empty";
  } else {
    const regEx =
      /^([0-9a-zA-Z]([-.\w]*[0-9a-zA-Z])*@([0-9a-zA-Z][-\w]*[0-9a-zA-Z]\.)+[a-zA-Z]{2,9})$/;
    if (!email.match(regEx)) {
      errors.email = "Email must be a valid address";
    }
  }
  if (password === "") {
    errors.password = "Password must not be empty";
  }
  if (password !== confirmPassword) {
    errors.confirmPassword = "Password must Match";
  }
  if (age === null) {
    errors.age = "age must not be empty";
  } else {
    if (new Date().getFullYear() - age < 13) {
      errors.age = "You must be atleast 13 years old to register";
    }
  }
  return {
    errors,
    valid: Object.keys(errors).length < 1,
  };
};

module.exports.validateLoginInput = (username, password) => {
  const errors = {};
  if (username.trim() === "") {
    errors.username = "Username must not be empty";
  }
  if (password === "") {
    errors.password = "Password must not be empty";
  }
  return {
    errors,
    valid: Object.keys(errors).length < 1,
  };
};
