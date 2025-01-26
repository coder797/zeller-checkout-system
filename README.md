# Zeller Checkout System

A flexible and extensible checkout system implementation in TypeScript that supports various pricing rules and discounts.

## Overview

This system implements a checkout process that can handle:
- Product catalog management
- Shopping cart functionality
- Configurable pricing rules
- Multiple discount types

## Features

### Pricing Rules
The system supports two types of pricing rules:

1. **Bulk Discount Rule**
   - Applies when quantity threshold is met
   - Changes unit price to a discounted amount
   - Example: Buy 4 or more iPads, price drops to $499.99 each

2. **Buy X Pay Y Rule**
   - Buy X items, only pay for Y items
   - Example: Buy 3 Apple TVs, pay for only 2

## Default Products

| SKU | Name | Price |
|-----|------|-------|
| ipd | Super iPad | $549.99 |
| mbp | MacBook Pro | $1399.99 |
| atv | Apple TV | $109.50 |
| vga | VGA adapter | $30.00 |

## Supported Pricing Rules

1. **Bulk Discount Rule**: Apply discounted price when quantity threshold is met
2. **Buy X Pay Y Rule**: Buy X items but only pay for Y items 


## Installation

1. Clone the repository:
  ```bash
  git clone https://github.com/coder797/zeller-checkout-system
  ```
2. Install the Dev dependencies:
  ```bash
  npm install
  ```



## Usage

To test this application
```bash
npm test
```
