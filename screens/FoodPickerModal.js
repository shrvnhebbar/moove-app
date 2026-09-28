import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, TextInput, TouchableOpacity, Modal, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { colors } from "../theme/colors";
import { shared } from "../theme/shared";
import { INDIAN_FOODS, FOOD_CATEGORIES } from "../data/indianFoods";
import { useCustomFoods } from "../hooks/useCustomFoods";

const CUSTOM_CATEGORY = "My Foods";
const CATEGORY_CHIPS = ["All", CUSTOM_CATEGORY, ...FOOD_CATEGORIES];

function scaleMacros(item, qty) {
  const factor = qty / item.baseQty;
  return {
    kcal: Math.round(item.kcal * factor),
    p: Math.round(item.p * factor * 10) / 10,
    c: Math.round(item.c * factor * 10) / 10,
    f: Math.round(item.f * factor * 10) / 10,
  };
}

function computeKcal(p, c, f) {
  return Math.round(p * 4 + c * 4 + f * 9);
}

function formatQty(qty, unit) {
  if (unit === "piece") return `${qty} pc`;
  if (unit === "serving") return `${qty} serving${Number(qty) === 1 ? "" : "s"}`;
  return `${qty}${unit}`;
}

function unitNoun(unit) {
  if (unit === "piece") return "pieces";
  if (unit === "serving") return "servings";
  return unit;
}

const fmt1 = (v) => Number(v || 0).toFixed(1);

function CategoryChips({ active, onChange }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={{ marginTop: 12, height: 44, flexGrow: 0, flexShrink: 0 }}
      contentContainerStyle={{ alignItems: "center", paddingHorizontal: 18 }}
    >
      {CATEGORY_CHIPS.map((cat) => {
        const isActive = cat === active;
        return (
          <TouchableOpacity
            key={cat}
            onPress={() => onChange(cat)}
            style={{
              paddingVertical: 9, paddingHorizontal: 14, borderRadius: 20, marginRight: 8,
              backgroundColor: isActive ? colors.accent : colors.surface2,
              borderWidth: 1, borderColor: isActive ? colors.accent : colors.border,
              alignItems: "center", justifyContent: "center",
            }}
          >
            <Text
              style={{
                fontSize: 12.5, fontWeight: "600", color: isActive ? colors.accentInk : colors.dim,
                lineHeight: 16, includeFontPadding: false, textAlignVertical: "center",
              }}
            >
              {cat}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

function FoodRow({ item, onPress }) {
  return (
    <TouchableOpacity style={[shared.card, { marginBottom: 10 }]} onPress={() => onPress(item)}>
      <View style={shared.row}>
        <View style={{ flex: 1, marginRight: 10 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Text style={{ color: colors.text, fontWeight: "600", fontSize: 14 }}>{item.name}</Text>
            {item.isCustom && (
              <View style={[shared.pill, shared.pillOk, { paddingVertical: 2, paddingHorizontal: 7 }]}>
                <Text style={[shared.pillOkText, { fontSize: 9.5 }]}>Custom</Text>
              </View>
            )}
          </View>
          <Text style={[shared.label, { marginTop: 3 }]}>
            per {formatQty(item.baseQty, item.unit)} · P {fmt1(item.p)}g · C {fmt1(item.c)}g · F {fmt1(item.f)}g
          </Text>
        </View>
        <Text style={{ ...shared.num, fontSize: 13.5 }}>{item.kcal} kcal</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function FoodPickerModal({ visible, mealName, onClose, onAddFood }) {
  const { customFoods, saveCustomFood } = useCustomFoods();
  const [tab, setTab] = useState("browse");
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [quantityTarget, setQuantityTarget] = useState(null); // { item, mode: "meal" | "ingredient" }
  const [qtyInput, setQtyInput] = useState("");

  const [customMode, setCustomMode] = useState("ingredients"); // "ingredients" | "manual"

  const [ingredientPickerVisible, setIngredientPickerVisible] = useState(false);
  const [builderName, setBuilderName] = useState("");
  const [builderIngredients, setBuilderIngredients] = useState([]);

  const [manualName, setManualName] = useState("");
  const [manualGrams, setManualGrams] = useState("");
  const [manualP, setManualP] = useState("");
  const [manualC, setManualC] = useState("");
  const [manualF, setManualF] = useState("");

  useEffect(() => {
    if (visible) {
      setTab("browse");
      setSearch("");
      setActiveCategory("All");
      setQuantityTarget(null);
      setCustomMode("ingredients");
    }
  }, [visible]);

  const customAsFoods = customFoods.map((f) => ({
    id: f.id, name: f.name, kcal: f.kcal, p: f.p, c: f.c, f: f.f,
    unit: f.unit || "serving", baseQty: f.baseQty || 1, category: CUSTOM_CATEGORY, isCustom: true,
  }));
  const allFoods = [...customAsFoods, ...INDIAN_FOODS];

  const filteredFoods = allFoods.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === "All" || item.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const openQuantity = (item, mode) => {
    setQtyInput(String(item.baseQty));
    setQuantityTarget({ item, mode });
  };

  const confirmQuantity = () => {
    if (!quantityTarget) return;
    const qty = Number(qtyInput) || quantityTarget.item.baseQty;
    const scaled = scaleMacros(quantityTarget.item, qty);
    if (quantityTarget.mode === "meal") {
      onAddFood(mealName, { name: quantityTarget.item.name, ...scaled });
      setQuantityTarget(null);
      onClose();
    } else {
      setBuilderIngredients((list) => [
        ...list,
        { id: Date.now().toString(), name: quantityTarget.item.name, qty, unit: quantityTarget.item.unit, ...scaled },
      ]);
      setQuantityTarget(null);
      setIngredientPickerVisible(false);
    }
  };

  const removeIngredient = (id) => setBuilderIngredients((list) => list.filter((i) => i.id !== id));

  const builderTotals = builderIngredients.reduce(
    (acc, i) => ({ kcal: acc.kcal + i.kcal, p: acc.p + i.p, c: acc.c + i.c, f: acc.f + i.f }),
    { kcal: 0, p: 0, c: 0, f: 0 }
  );

  const submitCustomFood = async () => {
    if (!builderName.trim() || builderIngredients.length === 0) return;
    await saveCustomFood({
      name: builderName.trim(),
      kcal: Math.round(builderTotals.kcal),
      p: Math.round(builderTotals.p * 10) / 10,
      c: Math.round(builderTotals.c * 10) / 10,
      f: Math.round(builderTotals.f * 10) / 10,
      unit: "serving",
      baseQty: 1,
      ingredients: builderIngredients.map((i) => ({ name: i.name, qty: i.qty, unit: i.unit })),
    });
    setBuilderName("");
    setBuilderIngredients([]);
    setTab("browse");
    setActiveCategory(CUSTOM_CATEGORY);
  };

  const round1 = (v) => Math.round((Number(v) || 0) * 10) / 10;
  const manualKcal = computeKcal(round1(manualP), round1(manualC), round1(manualF));

  const submitManualFood = async () => {
    const grams = Number(manualGrams);
    if (!manualName.trim() || !grams) return;
    const p = round1(manualP);
    const c = round1(manualC);
    const f = round1(manualF);
    await saveCustomFood({
      name: manualName.trim(),
      kcal: computeKcal(p, c, f),
      p, c, f,
      unit: "g",
      baseQty: grams,
    });
    setManualName("");
    setManualGrams("");
    setManualP("");
    setManualC("");
    setManualF("");
    setTab("browse");
    setActiveCategory(CUSTOM_CATEGORY);
  };

  const QuantityModal = (
    <Modal visible={!!quantityTarget} animationType="fade" transparent onRequestClose={() => setQuantityTarget(null)}>
      <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center", paddingHorizontal: 24 }}>
        <View style={[shared.card, { padding: 20 }]}>
          <View style={[shared.row, { marginBottom: 4 }]}>
            <Text style={shared.h3}>{quantityTarget?.item.name}</Text>
            <TouchableOpacity onPress={() => setQuantityTarget(null)}>
              <Feather name="x" size={18} color={colors.dim} />
            </TouchableOpacity>
          </View>
          <Text style={[shared.label, { marginBottom: 14 }]}>
            Base: {quantityTarget && formatQty(quantityTarget.item.baseQty, quantityTarget.item.unit)} · {quantityTarget?.item.kcal} kcal
          </Text>

          <Text style={[shared.label, { marginBottom: 6 }]}>
            Quantity ({quantityTarget && unitNoun(quantityTarget.item.unit)})
          </Text>
          <TextInput
            style={[shared.input, { marginBottom: 16 }]}
            keyboardType="numeric"
            value={qtyInput}
            onChangeText={(v) => setQtyInput(v.replace(/[^0-9.]/g, ""))}
            placeholder={String(quantityTarget?.item.baseQty ?? "")}
            placeholderTextColor={colors.dim2}
          />

          {quantityTarget && (
            <View style={{ flexDirection: "row", gap: 10, marginBottom: 16 }}>
              {(() => {
                const scaled = scaleMacros(quantityTarget.item, Number(qtyInput) || quantityTarget.item.baseQty);
                return (
                  <>
                    <Text style={shared.label}>{scaled.kcal} kcal</Text>
                    <Text style={shared.label}>P {fmt1(scaled.p)}g</Text>
                    <Text style={shared.label}>C {fmt1(scaled.c)}g</Text>
                    <Text style={shared.label}>F {fmt1(scaled.f)}g</Text>
                  </>
                );
              })()}
            </View>
          )}

          <TouchableOpacity style={[shared.btn, shared.btnPrimary]} onPress={confirmQuantity}>
            <Text style={shared.btnPrimaryText}>
              {quantityTarget?.mode === "meal" ? `Add to ${mealName}` : "Add Ingredient"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const IngredientPickerModal = (
    <Modal visible={ingredientPickerVisible} animationType="slide" onRequestClose={() => setIngredientPickerVisible(false)}>
      <SafeAreaView style={shared.screen} edges={["top"]}>
        <View style={[shared.row, { paddingHorizontal: 18, paddingTop: 12, paddingBottom: 4 }]}>
          <Text style={shared.h2}>Add Ingredient</Text>
          <TouchableOpacity style={shared.iconBtn} onPress={() => setIngredientPickerVisible(false)}>
            <Feather name="x" size={18} color={colors.text} />
          </TouchableOpacity>
        </View>
        <View style={{ paddingHorizontal: 18, paddingTop: 12 }}>
          <TextInput
            style={shared.input}
            placeholder="Search foods"
            placeholderTextColor={colors.dim2}
            value={search}
            onChangeText={setSearch}
          />
        </View>
        <CategoryChips active={activeCategory} onChange={setActiveCategory} />
        <FlatList
          data={filteredFoods}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 18, paddingTop: 14, paddingBottom: 40 }}
          ListEmptyComponent={
            <Text style={shared.label}>
              {search ? `No foods match "${search}".` : "No foods in this category yet."}
            </Text>
          }
          renderItem={({ item }) => <FoodRow item={item} onPress={(i) => openQuantity(i, "ingredient")} />}
        />
      </SafeAreaView>
      {QuantityModal}
    </Modal>
  );

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={shared.screen} edges={["top"]}>
        <View style={[shared.row, { paddingHorizontal: 18, paddingTop: 12, paddingBottom: 4 }]}>
          <Text style={shared.h2}>Add Food</Text>
          <TouchableOpacity style={shared.iconBtn} onPress={onClose}>
            <Feather name="x" size={18} color={colors.text} />
          </TouchableOpacity>
        </View>

        <View style={{ flexDirection: "row", paddingHorizontal: 18, marginTop: 14, gap: 8 }}>
          {[
            { key: "browse", label: "Browse" },
            { key: "custom", label: "Create Custom" },
          ].map((t) => {
            const isActive = tab === t.key;
            return (
              <TouchableOpacity
                key={t.key}
                onPress={() => setTab(t.key)}
                style={[
                  shared.btn,
                  { flex: 1, paddingVertical: 11 },
                  isActive ? shared.btnPrimary : shared.btnGhost,
                ]}
              >
                <Text style={isActive ? shared.btnPrimaryText : shared.btnGhostText}>{t.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {tab === "browse" ? (
          <>
            <View style={{ paddingHorizontal: 18, paddingTop: 14 }}>
              <TextInput
                style={shared.input}
                placeholder="Search foods"
                placeholderTextColor={colors.dim2}
                value={search}
                onChangeText={setSearch}
              />
            </View>
            <CategoryChips active={activeCategory} onChange={setActiveCategory} />
            <FlatList
              data={filteredFoods}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ paddingHorizontal: 18, paddingTop: 14, paddingBottom: 40 }}
              ListEmptyComponent={
            <Text style={shared.label}>
              {search ? `No foods match "${search}".` : "No foods in this category yet."}
            </Text>
          }
              renderItem={({ item }) => <FoodRow item={item} onPress={(i) => openQuantity(i, "meal")} />}
            />
          </>
        ) : (
          <ScrollView contentContainerStyle={shared.content} style={{ marginTop: 14 }}>
            <View style={{ flexDirection: "row", gap: 8, marginBottom: 20 }}>
              {[
                { key: "ingredients", label: "From Ingredients" },
                { key: "manual", label: "Manual Entry" },
              ].map((m) => {
                const isActive = customMode === m.key;
                return (
                  <TouchableOpacity
                    key={m.key}
                    onPress={() => setCustomMode(m.key)}
                    style={{
                      flex: 1, paddingVertical: 9, borderRadius: 20,
                      backgroundColor: isActive ? colors.accent : colors.surface2,
                      borderWidth: 1, borderColor: isActive ? colors.accent : colors.border,
                      alignItems: "center", justifyContent: "center",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 12.5, fontWeight: "600", color: isActive ? colors.accentInk : colors.dim,
                        lineHeight: 16, includeFontPadding: false, textAlignVertical: "center",
                      }}
                    >
                      {m.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {customMode === "ingredients" ? (
              <>
                <Text style={[shared.label, { marginBottom: 6 }]}>Custom food name</Text>
                <TextInput
                  style={[shared.input, { marginBottom: 18 }]}
                  placeholder="e.g. My Chicken Biryani Bowl"
                  placeholderTextColor={colors.dim2}
                  value={builderName}
                  onChangeText={setBuilderName}
                />

                <Text style={[shared.h3, { marginBottom: 10 }]}>Ingredients ({builderIngredients.length})</Text>
                {builderIngredients.length === 0 && <Text style={[shared.label, { marginBottom: 12 }]}>No ingredients added yet.</Text>}
                {builderIngredients.map((ing) => (
                  <View style={[shared.card, shared.row, { marginBottom: 8 }]} key={ing.id}>
                    <View style={{ flex: 1, marginRight: 10 }}>
                      <Text style={{ color: colors.text, fontWeight: "600", fontSize: 13.5 }}>{ing.name}</Text>
                      <Text style={[shared.label, { marginTop: 2 }]}>
                        {formatQty(ing.qty, ing.unit)} · {ing.kcal} kcal · P {fmt1(ing.p)}g · C {fmt1(ing.c)}g · F {fmt1(ing.f)}g
                      </Text>
                    </View>
                    <TouchableOpacity onPress={() => removeIngredient(ing.id)}>
                      <Feather name="trash-2" size={15} color={colors.dim} />
                    </TouchableOpacity>
                  </View>
                ))}

                <TouchableOpacity style={[shared.btn, shared.btnGhost, { marginTop: 4, marginBottom: 20 }]} onPress={() => setIngredientPickerVisible(true)}>
                  <Feather name="plus" size={14} color={colors.text} />
                  <Text style={shared.btnGhostText}>Add Ingredient</Text>
                </TouchableOpacity>

                {builderIngredients.length > 0 && (
                  <View style={[shared.card, { marginBottom: 20 }]}>
                    <Text style={[shared.label, { marginBottom: 8 }]}>Total</Text>
                    <View style={shared.row}>
                      <Text style={{ ...shared.num, fontSize: 15 }}>{Math.round(builderTotals.kcal)} kcal</Text>
                      <Text style={shared.label}>
                        P {fmt1(builderTotals.p)}g · C {fmt1(builderTotals.c)}g · F {fmt1(builderTotals.f)}g
                      </Text>
                    </View>
                  </View>
                )}

                <TouchableOpacity
                  style={[shared.btn, shared.btnPrimary, (!builderName.trim() || builderIngredients.length === 0) && { opacity: 0.5 }]}
                  onPress={submitCustomFood}
                  disabled={!builderName.trim() || builderIngredients.length === 0}
                >
                  <Text style={shared.btnPrimaryText}>Save Custom Food</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={[shared.label, { marginBottom: 6 }]}>Food name</Text>
                <TextInput
                  style={[shared.input, { marginBottom: 14 }]}
                  placeholder="e.g. Mom's Paneer Sabzi"
                  placeholderTextColor={colors.dim2}
                  value={manualName}
                  onChangeText={setManualName}
                />

                <Text style={[shared.label, { marginBottom: 6 }]}>Per how many grams</Text>
                <TextInput
                  style={[shared.input, { marginBottom: 14 }]}
                  placeholder="e.g. 100"
                  placeholderTextColor={colors.dim2}
                  keyboardType="numeric"
                  value={manualGrams}
                  onChangeText={(v) => setManualGrams(v.replace(/[^0-9.]/g, ""))}
                />

                <View style={{ flexDirection: "row", gap: 8, marginBottom: 20 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={[shared.label, { marginBottom: 6 }]}>Protein (g)</Text>
                    <TextInput
                      style={shared.input}
                      placeholder="0"
                      placeholderTextColor={colors.dim2}
                      keyboardType="numeric"
                      value={manualP}
                      onChangeText={(v) => setManualP(v.replace(/[^0-9.]/g, ""))}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[shared.label, { marginBottom: 6 }]}>Carbs (g)</Text>
                    <TextInput
                      style={shared.input}
                      placeholder="0"
                      placeholderTextColor={colors.dim2}
                      keyboardType="numeric"
                      value={manualC}
                      onChangeText={(v) => setManualC(v.replace(/[^0-9.]/g, ""))}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[shared.label, { marginBottom: 6 }]}>Fat (g)</Text>
                    <TextInput
                      style={shared.input}
                      placeholder="0"
                      placeholderTextColor={colors.dim2}
                      keyboardType="numeric"
                      value={manualF}
                      onChangeText={(v) => setManualF(v.replace(/[^0-9.]/g, ""))}
                    />
                  </View>
                </View>

                <View style={[shared.card, { marginBottom: 20 }]}>
                  <Text style={[shared.label, { marginBottom: 8 }]}>Calculated calories</Text>
                  <Text style={{ ...shared.num, fontSize: 15 }}>{manualKcal} kcal{manualGrams ? ` per ${manualGrams}g` : ""}</Text>
                </View>

                <TouchableOpacity
                  style={[shared.btn, shared.btnPrimary, (!manualName.trim() || !manualGrams) && { opacity: 0.5 }]}
                  onPress={submitManualFood}
                  disabled={!manualName.trim() || !manualGrams}
                >
                  <Text style={shared.btnPrimaryText}>Save Custom Food</Text>
                </TouchableOpacity>
              </>
            )}
          </ScrollView>
        )}
      </SafeAreaView>
      {tab === "browse" && QuantityModal}
      {IngredientPickerModal}
    </Modal>
  );
}
