# -*- coding: utf-8 -*-
from pathlib import Path
import os
from itertools import combinations

import pandas as pd


category_map = {
    "Milk": "Dairy",
    "Butter": "Dairy",
    "Yogurt": "Dairy",
    "Labneh": "Dairy",
    "Laban": "Dairy",
    "Cheddar cheese": "Dairy",
    "Potato chips": "Snacks_Sweets",
    "Cookies": "Snacks_Sweets",
    "Crackers": "Snacks_Sweets",
    "Popcorn": "Snacks_Sweets",
    "Chocolate bars": "Snacks_Sweets",
    "Ice cream": "Snacks_Sweets",
    "Protein bars": "Snacks_Sweets",
    "Frozen pizza": "Frozen_Food",
    "Frozen nuggets": "Frozen_Food",
    "Frozen fries": "Frozen_Food",
    "Frozen samosas": "Frozen_Food",
    "Frozen spring rolls": "Frozen_Food",
    "Burger patties": "Frozen_Food",
    "Hot dogs": "Frozen_Food",
    "Soft drinks": "Beverages",
    "Water bottles": "Beverages",
    "Iced tea": "Beverages",
    "Energy drinks": "Beverages",
    "Orange juice": "Beverages",
    "Apple juice": "Beverages",
    "Coffee": "Beverages",
    "Tea bags": "Beverages",
    "Hot chocolate": "Beverages",
    "Almond milk": "Beverages",
    "Soy milk": "Beverages",
    "Coconut milk": "Beverages",
    "White bread": "Breakfast_Bakery",
    "Oats": "Breakfast_Bakery",
    "Cornflakes": "Breakfast_Bakery",
    "Granola": "Breakfast_Bakery",
    "Mayonnaise": "Pantry_Condiments",
    "Ketchup": "Pantry_Condiments",
    "Jam": "Pantry_Condiments",
    "Honey": "Pantry_Condiments",
    "Peanut butter": "Pantry_Condiments",
    "Olive oil": "Pantry_Condiments",
    "Tuna cans": "Pantry_Condiments",
    "Pasta": "Pantry_Condiments",
    "Rice": "Pantry_Condiments",
}

_final_rules = None


def _get_data_path():
    configured_path = os.environ.get("SUPERMARKET_TRANSACTIONS_CSV")
    if configured_path:
        return Path(configured_path)

    return Path(__file__).with_name("supermarket_transactions.csv")


def _build_rules():
    data_path = _get_data_path()

    if not data_path.exists():
        raise FileNotFoundError(
            f"Transactions CSV not found at {data_path}. "
            "Set SUPERMARKET_TRANSACTIONS_CSV or add supermarket_transactions.csv next to association.py."
        )

    df = pd.read_csv(data_path)

    if "Products" not in df.columns:
        raise ValueError("Transactions CSV must contain a Products column.")

    transactions = df["Products"].dropna().apply(
        lambda value: [item.strip() for item in str(value).split(",")]
    ).tolist()

    transformed_transactions = []

    for transaction in transactions:
        mapped_tx = list({
            category_map[item]
            for item in transaction
            if item in category_map
        })

        if mapped_tx:
            transformed_transactions.append(mapped_tx)

    if not transformed_transactions:
        raise ValueError("No valid transactions found after mapping products to categories.")

    return _generate_association_rules(transformed_transactions)


def _generate_association_rules(transactions, min_support=0.1, min_confidence=0.3):
    transaction_sets = [set(transaction) for transaction in transactions]
    total_transactions = len(transaction_sets)
    itemset_counts = {}

    for transaction in transaction_sets:
        for size in range(1, len(transaction) + 1):
            for itemset in combinations(sorted(transaction), size):
                itemset_counts[frozenset(itemset)] = itemset_counts.get(frozenset(itemset), 0) + 1

    supports = {
        itemset: count / total_transactions
        for itemset, count in itemset_counts.items()
        if count / total_transactions >= min_support
    }

    rules = []

    for itemset, support in supports.items():
        if len(itemset) < 2:
            continue

        items = sorted(itemset)

        for antecedent_size in range(1, len(items)):
            for antecedent_tuple in combinations(items, antecedent_size):
                antecedent = frozenset(antecedent_tuple)
                consequent = itemset - antecedent
                antecedent_support = supports.get(antecedent)
                consequent_support = supports.get(consequent)

                if not antecedent_support or not consequent_support:
                    continue

                confidence = support / antecedent_support

                if confidence < min_confidence:
                    continue

                lift = confidence / consequent_support
                rules.append({
                    "antecedents": list(antecedent),
                    "consequents": list(consequent),
                    "support": support,
                    "confidence": confidence,
                    "lift": lift,
                })

    if not rules:
        return pd.DataFrame(columns=["antecedents", "consequents"])

    return pd.DataFrame(rules).sort_values(by="lift", ascending=False).reset_index(drop=True)


def _get_rules():
    global _final_rules

    if _final_rules is None:
        _final_rules = _build_rules()

    return _final_rules


def get_recommendations(items):
    if not isinstance(items, list):
        raise ValueError("items must be a list.")

    recommendations = set()
    input_categories = set()

    for item in items:
        if item in category_map:
            input_categories.add(category_map[item])
        else:
            input_categories.add(item)

    final_rules = _get_rules()

    for _, row in final_rules.iterrows():
        antecedents = set(row["antecedents"])

        if antecedents.issubset(input_categories):
            for category in row["consequents"]:
                for product, product_category in category_map.items():
                    if product_category == category:
                        recommendations.add(product)

    return sorted(recommendations)
