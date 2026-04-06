package edu.cit.canete.laundrylink.entity;

public enum UserRole {
    CUSTOMER,
    SHOP_OWNER,
    ADMIN;

    public static boolean isSelfServiceRole(String role) {
        if (role == null || role.isBlank()) {
            return true;
        }

        return CUSTOMER.name().equalsIgnoreCase(role) || SHOP_OWNER.name().equalsIgnoreCase(role);
    }

    public static String normalizeForRegistration(String role) {
        if (role == null || role.isBlank()) {
            return CUSTOMER.name();
        }

        if (CUSTOMER.name().equalsIgnoreCase(role)) {
            return CUSTOMER.name();
        }

        if (SHOP_OWNER.name().equalsIgnoreCase(role)) {
            return SHOP_OWNER.name();
        }

        throw new IllegalArgumentException("Invalid role. Choose CUSTOMER or SHOP_OWNER.");
    }
}