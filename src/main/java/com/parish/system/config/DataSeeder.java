package com.parish.system.config;

import com.parish.system.billing.BillingAppliesTo;
import com.parish.system.billing.BillingFrequency;
import com.parish.system.billing.BillingItem;
import com.parish.system.billing.BillingItemRepository;
import com.parish.system.user.Role;
import com.parish.system.user.RoleName;
import com.parish.system.user.RoleRepository;
import com.parish.system.user.User;
import com.parish.system.user.UserRepository;
import java.math.BigDecimal;
import java.util.Arrays;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
@RequiredArgsConstructor
public class DataSeeder {
    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final BillingItemRepository billingItemRepository;
    private final PasswordEncoder passwordEncoder;

    @Bean
    CommandLineRunner seedData() {
        return args -> {
            Arrays.stream(RoleName.values()).forEach(roleName -> roleRepository.findByName(roleName).orElseGet(() -> {
                Role role = new Role();
                role.setName(roleName);
                return roleRepository.save(role);
            }));

            if (!userRepository.existsByUsername("admin")) {
                User admin = new User();
                admin.setUsername("admin");
                admin.setPassword(passwordEncoder.encode("Admin@12345"));
                admin.setRole(roleRepository.findByName(RoleName.SUPER_ADMIN).orElseThrow());
                userRepository.save(admin);
            }

            if (billingItemRepository.count() == 0) {
                BillingItem item = new BillingItem();
                item.setName("Monthly Parish Contribution");
                item.setAmount(new BigDecimal("5.00"));
                item.setCurrency("USD");
                item.setFrequency(BillingFrequency.MONTHLY);
                item.setAppliesTo(BillingAppliesTo.ALL_MEMBERS);
                billingItemRepository.save(item);
            }
        };
    }
}
