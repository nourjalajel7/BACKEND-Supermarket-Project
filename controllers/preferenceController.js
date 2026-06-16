const sanitizePreferences = (user) => ({
  fulfillment: user.preferences?.fulfillment || "pickup",
  health: {
    diabetes: Boolean(user.preferences?.health?.diabetes),
    gluten: Boolean(user.preferences?.health?.gluten),
    peanut: Boolean(user.preferences?.health?.peanut),
    lowSodium: Boolean(user.preferences?.health?.lowSodium),
    vegan: Boolean(user.preferences?.health?.vegan)
  }
});

const getPreferences = async (req, res) => {
  res.json(sanitizePreferences(req.user));
};

const updatePreferences = async (req, res) => {
  try {
    const current = sanitizePreferences(req.user);
    req.user.preferences = {
      fulfillment: req.body.fulfillment || current.fulfillment,
      health: { ...current.health, ...(req.body.health || {}) }
    };
    await req.user.save();
    res.json({ message: "Preferences updated", preferences: sanitizePreferences(req.user) });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = { getPreferences, updatePreferences, sanitizePreferences };
