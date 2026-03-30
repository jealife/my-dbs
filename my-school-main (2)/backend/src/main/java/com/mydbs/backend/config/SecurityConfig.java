package com.mydbs.backend.config;

import com.mydbs.backend.auth.security.JwtAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final UserDetailsService userDetailsService;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter,
                          UserDetailsService userDetailsService) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
        this.userDetailsService = userDetailsService;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(Customizer.withDefaults())
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(
                                "/api/auth/**",
                                "/swagger-ui.html",
                                "/swagger-ui/**",
                                "/api-docs/**",
                                "/actuator/health",
                                "/api/course-resources/download-by-path"
                        ).permitAll()

                        .requestMatchers(HttpMethod.GET, "/api/users/**").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/users/*/photo").authenticated()
                        .requestMatchers("/api/users/**")
                        .hasAnyAuthority("SUPER_ADMIN", "ADMIN")

                        .requestMatchers(HttpMethod.GET, "/api/academic-years/**").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/programs/**").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/cohorts/**").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/classes/**").authenticated()

                        .requestMatchers("/api/academic-years/**")
                        .hasAnyAuthority("SUPER_ADMIN", "ADMIN", "PEDAGOGICAL_MANAGER", "SCHOOL_MANAGER")

                        .requestMatchers("/api/programs/**")
                        .hasAnyAuthority("SUPER_ADMIN", "ADMIN", "PEDAGOGICAL_MANAGER", "SCHOOL_MANAGER")

                        .requestMatchers("/api/cohorts/**")
                        .hasAnyAuthority("SUPER_ADMIN", "ADMIN", "PEDAGOGICAL_MANAGER", "SCHOOL_MANAGER")

                        .requestMatchers("/api/classes/**")
                        .hasAnyAuthority("SUPER_ADMIN", "ADMIN", "PEDAGOGICAL_MANAGER", "SCHOOL_MANAGER")

                        .requestMatchers(HttpMethod.GET, "/api/courses/**").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/course-modules/**").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/lessons/**").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/course-sessions/**").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/course-resources/**").authenticated()

                        .requestMatchers("/api/courses/**")
                        .hasAnyAuthority("SUPER_ADMIN", "ADMIN", "PEDAGOGICAL_MANAGER", "SCHOOL_MANAGER", "TEACHER")

                        .requestMatchers("/api/course-modules/**")
                        .hasAnyAuthority("SUPER_ADMIN", "ADMIN", "PEDAGOGICAL_MANAGER", "SCHOOL_MANAGER", "TEACHER")

                        .requestMatchers("/api/lessons/**")
                        .hasAnyAuthority("SUPER_ADMIN", "ADMIN", "PEDAGOGICAL_MANAGER", "SCHOOL_MANAGER", "TEACHER")

                        .requestMatchers("/api/course-sessions/**")
                        .hasAnyAuthority("SUPER_ADMIN", "ADMIN", "PEDAGOGICAL_MANAGER", "SCHOOL_MANAGER", "TEACHER")

                        .requestMatchers("/api/course-resources/**")
                        .hasAnyAuthority("SUPER_ADMIN", "ADMIN", "PEDAGOGICAL_MANAGER", "SCHOOL_MANAGER", "TEACHER")

                        .requestMatchers(HttpMethod.GET, "/api/students/**").authenticated()
                        .requestMatchers(HttpMethod.PUT, "/api/students/**")
                        .hasAnyAuthority("SUPER_ADMIN", "ADMIN", "PEDAGOGICAL_MANAGER", "SCHOOL_MANAGER", "STUDENT")
                        .requestMatchers("/api/students/**")
                        .hasAnyAuthority("SUPER_ADMIN", "ADMIN", "PEDAGOGICAL_MANAGER", "SCHOOL_MANAGER", "SUPPORT")

                        .requestMatchers(HttpMethod.GET, "/api/classes/*/students").authenticated()
                        .requestMatchers("/api/classes/*/students")
                        .hasAnyAuthority("SUPER_ADMIN", "ADMIN", "PEDAGOGICAL_MANAGER", "SCHOOL_MANAGER", "TEACHER", "SUPPORT")

                        .requestMatchers(HttpMethod.GET, "/api/teachers/**").authenticated()
                        .requestMatchers(HttpMethod.PUT, "/api/teachers/**")
                        .hasAnyAuthority("SUPER_ADMIN", "ADMIN", "PEDAGOGICAL_MANAGER", "SCHOOL_MANAGER", "TEACHER")
                        .requestMatchers("/api/teachers/**")
                        .hasAnyAuthority("SUPER_ADMIN", "ADMIN", "PEDAGOGICAL_MANAGER", "SCHOOL_MANAGER", "SUPPORT")

                        .requestMatchers(HttpMethod.GET, "/api/programs/*/teachers").authenticated()
                        .requestMatchers("/api/programs/*/teachers")
                        .hasAnyAuthority("SUPER_ADMIN", "ADMIN", "PEDAGOGICAL_MANAGER", "SCHOOL_MANAGER", "SUPPORT")

                        // ── Admissions ────────────────────────────────────────────────
                        .requestMatchers(HttpMethod.POST, "/api/v1/admissions")
                        .hasAnyAuthority("SUPER_ADMIN", "ADMIN", "SCHOOL_MANAGER", "CANDIDATE")

                        .requestMatchers(HttpMethod.GET, "/api/v1/admissions/**")
                        .hasAnyAuthority("SUPER_ADMIN", "ADMIN", "SCHOOL_MANAGER", "PEDAGOGICAL_MANAGER", "CANDIDATE")

                        .requestMatchers(HttpMethod.PUT, "/api/v1/admissions/**")
                        .hasAnyAuthority("SUPER_ADMIN", "ADMIN", "SCHOOL_MANAGER", "CANDIDATE")

                        .requestMatchers(HttpMethod.PATCH, "/api/v1/admissions/**")
                        .hasAnyAuthority("SUPER_ADMIN", "ADMIN", "SCHOOL_MANAGER", "PEDAGOGICAL_MANAGER")

                        .requestMatchers(HttpMethod.DELETE, "/api/v1/admissions/**")
                        .hasAnyAuthority("SUPER_ADMIN", "ADMIN", "SCHOOL_MANAGER")

                        // ── Evaluations ───────────────────────────────────────────────
                        .requestMatchers(HttpMethod.GET, "/api/v1/evaluations/**")
                        .hasAnyAuthority("SUPER_ADMIN", "ADMIN", "PEDAGOGICAL_MANAGER", "SCHOOL_MANAGER", "TEACHER", "STUDENT")

                        .requestMatchers(HttpMethod.POST, "/api/v1/evaluations/deliberations/**")
                        .hasAnyAuthority("SUPER_ADMIN", "ADMIN", "PEDAGOGICAL_MANAGER")

                        .requestMatchers(HttpMethod.POST, "/api/v1/evaluations/**")
                        .hasAnyAuthority("SUPER_ADMIN", "ADMIN", "PEDAGOGICAL_MANAGER", "TEACHER")

                        .requestMatchers(HttpMethod.PUT, "/api/v1/evaluations/**")
                        .hasAnyAuthority("SUPER_ADMIN", "ADMIN", "PEDAGOGICAL_MANAGER", "TEACHER")

                        .requestMatchers(HttpMethod.PATCH, "/api/v1/evaluations/**")
                        .hasAnyAuthority("SUPER_ADMIN", "ADMIN", "PEDAGOGICAL_MANAGER", "TEACHER")

                        .requestMatchers(HttpMethod.DELETE, "/api/v1/evaluations/**")
                        .hasAnyAuthority("SUPER_ADMIN", "ADMIN", "PEDAGOGICAL_MANAGER")

                        // ── Assignments & Quiz ───────────────────────────────────────
                        .requestMatchers(HttpMethod.GET, "/api/v1/assignments/**")
                        .hasAnyAuthority("SUPER_ADMIN", "ADMIN", "PEDAGOGICAL_MANAGER", "SCHOOL_MANAGER", "TEACHER", "STUDENT")

                        .requestMatchers(HttpMethod.POST, "/api/v1/assignments/*/submissions")
                        .hasAnyAuthority("SUPER_ADMIN", "ADMIN", "STUDENT", "TEACHER")

                        .requestMatchers(HttpMethod.POST, "/api/v1/assignments/*/quiz/start")
                        .hasAnyAuthority("SUPER_ADMIN", "ADMIN", "STUDENT")

                        .requestMatchers(HttpMethod.POST, "/api/v1/assignments/quiz/attempts/*/submit")
                        .hasAnyAuthority("SUPER_ADMIN", "ADMIN", "STUDENT")

                        .requestMatchers(HttpMethod.POST, "/api/v1/assignments/**")
                        .hasAnyAuthority("SUPER_ADMIN", "ADMIN", "PEDAGOGICAL_MANAGER", "TEACHER")

                        .requestMatchers(HttpMethod.PUT, "/api/v1/assignments/**")
                        .hasAnyAuthority("SUPER_ADMIN", "ADMIN", "PEDAGOGICAL_MANAGER", "TEACHER")

                        .requestMatchers(HttpMethod.PATCH, "/api/v1/assignments/**")
                        .hasAnyAuthority("SUPER_ADMIN", "ADMIN", "PEDAGOGICAL_MANAGER", "TEACHER")

                        .requestMatchers(HttpMethod.DELETE, "/api/v1/assignments/**")
                        .hasAnyAuthority("SUPER_ADMIN", "ADMIN", "PEDAGOGICAL_MANAGER")

                        // ── Attendance ───────────────────────────────────────────────
                        .requestMatchers(HttpMethod.GET, "/api/v1/attendance/**")
                        .hasAnyAuthority("SUPER_ADMIN", "ADMIN", "PEDAGOGICAL_MANAGER", "SCHOOL_MANAGER", "TEACHER", "STUDENT")

                        .requestMatchers(HttpMethod.POST, "/api/v1/attendance/justifications")
                        .hasAnyAuthority("SUPER_ADMIN", "ADMIN", "PEDAGOGICAL_MANAGER", "TEACHER", "STUDENT")

                        .requestMatchers(HttpMethod.POST, "/api/v1/attendance/**")
                        .hasAnyAuthority("SUPER_ADMIN", "ADMIN", "PEDAGOGICAL_MANAGER", "TEACHER")

                        .requestMatchers(HttpMethod.PATCH, "/api/v1/attendance/**")
                        .hasAnyAuthority("SUPER_ADMIN", "ADMIN", "PEDAGOGICAL_MANAGER", "TEACHER")

                        .requestMatchers(HttpMethod.DELETE, "/api/v1/attendance/**")
                        .hasAnyAuthority("SUPER_ADMIN", "ADMIN", "PEDAGOGICAL_MANAGER")

                        // ── Grades & Bulletins ──────────────────────────────────────
                        .requestMatchers(HttpMethod.GET, "/api/v1/grades/**")
                        .hasAnyAuthority("SUPER_ADMIN", "ADMIN", "PEDAGOGICAL_MANAGER", "SCHOOL_MANAGER", "TEACHER", "STUDENT")

                        .requestMatchers(HttpMethod.POST, "/api/v1/grades/**")
                        .hasAnyAuthority("SUPER_ADMIN", "ADMIN", "PEDAGOGICAL_MANAGER", "TEACHER")

                        .requestMatchers(HttpMethod.PATCH, "/api/v1/grades/**")
                        .hasAnyAuthority("SUPER_ADMIN", "ADMIN", "PEDAGOGICAL_MANAGER", "TEACHER")

                        .requestMatchers(HttpMethod.DELETE, "/api/v1/grades/**")
                        .hasAnyAuthority("SUPER_ADMIN", "ADMIN", "PEDAGOGICAL_MANAGER")

                        // ── Finance ──────────────────────────────────────────────────
                        .requestMatchers(HttpMethod.GET, "/api/v1/finance/**")
                        .hasAnyAuthority("SUPER_ADMIN", "ADMIN", "SCHOOL_MANAGER", "STUDENT")

                        .requestMatchers(HttpMethod.POST, "/api/v1/finance/**")
                        .hasAnyAuthority("SUPER_ADMIN", "ADMIN", "SCHOOL_MANAGER")

                        .requestMatchers(HttpMethod.PATCH, "/api/v1/finance/**")
                        .hasAnyAuthority("SUPER_ADMIN", "ADMIN", "SCHOOL_MANAGER")

                        // ── GED / Documents ──────────────────────────────────────────
                        .requestMatchers(HttpMethod.GET, "/api/v1/documents/**")
                        .hasAnyAuthority("SUPER_ADMIN", "ADMIN", "SCHOOL_MANAGER", "PEDAGOGICAL_MANAGER", "TEACHER", "STUDENT")

                        .requestMatchers(HttpMethod.POST, "/api/v1/documents/**")
                        .hasAnyAuthority("SUPER_ADMIN", "ADMIN", "SCHOOL_MANAGER", "PEDAGOGICAL_MANAGER", "TEACHER", "STUDENT")

                        .requestMatchers(HttpMethod.DELETE, "/api/v1/documents/**")
                        .hasAnyAuthority("SUPER_ADMIN", "ADMIN", "SCHOOL_MANAGER", "PEDAGOGICAL_MANAGER")

                        // ── Communication & Notifications ────────────────────────────
                        .requestMatchers(HttpMethod.GET, "/api/v1/communications/**")
                        .hasAnyAuthority("SUPER_ADMIN", "ADMIN", "SCHOOL_MANAGER", "PEDAGOGICAL_MANAGER", "TEACHER", "STUDENT")

                        .requestMatchers(HttpMethod.POST, "/api/v1/communications/**")
                        .hasAnyAuthority("SUPER_ADMIN", "ADMIN", "SCHOOL_MANAGER", "PEDAGOGICAL_MANAGER", "TEACHER", "STUDENT")

                        .requestMatchers(HttpMethod.PATCH, "/api/v1/communications/**")
                        .hasAnyAuthority("SUPER_ADMIN", "ADMIN", "SCHOOL_MANAGER", "PEDAGOGICAL_MANAGER", "TEACHER", "STUDENT")

                        .requestMatchers(HttpMethod.DELETE, "/api/v1/communications/**")
                        .hasAnyAuthority("SUPER_ADMIN", "ADMIN", "SCHOOL_MANAGER", "PEDAGOGICAL_MANAGER")

                        // ── Mentorat ─────────────────────────────────────────────────
                        .requestMatchers(HttpMethod.GET, "/api/v1/mentoring/**")
                        .hasAnyAuthority("SUPER_ADMIN", "ADMIN", "PEDAGOGICAL_MANAGER", "TEACHER", "STUDENT")

                        .requestMatchers(HttpMethod.POST, "/api/v1/mentoring/**")
                        .hasAnyAuthority("SUPER_ADMIN", "ADMIN", "PEDAGOGICAL_MANAGER", "TEACHER", "STUDENT")

                        .requestMatchers(HttpMethod.PATCH, "/api/v1/mentoring/**")
                        .hasAnyAuthority("SUPER_ADMIN", "ADMIN", "PEDAGOGICAL_MANAGER", "TEACHER", "STUDENT")

                        // ── Carrière & Portfolio ─────────────────────────────────────
                        .requestMatchers(HttpMethod.GET, "/api/v1/career/**")
                        .hasAnyAuthority("SUPER_ADMIN", "ADMIN", "SCHOOL_MANAGER", "PEDAGOGICAL_MANAGER", "TEACHER", "STUDENT")

                        .requestMatchers(HttpMethod.POST, "/api/v1/career/**")
                        .hasAnyAuthority("SUPER_ADMIN", "ADMIN", "SCHOOL_MANAGER", "PEDAGOGICAL_MANAGER", "STUDENT")

                        .requestMatchers(HttpMethod.PATCH, "/api/v1/career/**")
                        .hasAnyAuthority("SUPER_ADMIN", "ADMIN", "SCHOOL_MANAGER", "PEDAGOGICAL_MANAGER")

                        // ── Analytics & IA ────────────────────────────────────────────
                        .requestMatchers(HttpMethod.GET, "/api/v1/analytics/**")
                        .hasAnyAuthority("SUPER_ADMIN", "ADMIN", "SCHOOL_MANAGER", "PEDAGOGICAL_MANAGER", "TEACHER", "STUDENT")

                        .requestMatchers(HttpMethod.POST, "/api/v1/analytics/**")
                        .hasAnyAuthority("SUPER_ADMIN", "ADMIN", "SCHOOL_MANAGER", "PEDAGOGICAL_MANAGER")

                        .requestMatchers(HttpMethod.PATCH, "/api/v1/analytics/**")
                        .hasAnyAuthority("SUPER_ADMIN", "ADMIN", "PEDAGOGICAL_MANAGER")

                        // ── Planning & Agenda ─────────────────────────────────────────────
                        .requestMatchers(HttpMethod.GET, "/api/v1/planning/**")
                        .hasAnyAuthority("SUPER_ADMIN", "ADMIN", "SCHOOL_MANAGER", "PEDAGOGICAL_MANAGER", "TEACHER", "STUDENT")

                        .requestMatchers(HttpMethod.POST, "/api/v1/planning/**")
                        .hasAnyAuthority("SUPER_ADMIN", "ADMIN", "SCHOOL_MANAGER", "PEDAGOGICAL_MANAGER", "TEACHER")

                        .requestMatchers(HttpMethod.PUT, "/api/v1/planning/**")
                        .hasAnyAuthority("SUPER_ADMIN", "ADMIN", "SCHOOL_MANAGER", "PEDAGOGICAL_MANAGER", "TEACHER")

                        .requestMatchers(HttpMethod.DELETE, "/api/v1/planning/**")
                        .hasAnyAuthority("SUPER_ADMIN", "ADMIN", "PEDAGOGICAL_MANAGER")

                        // ── Compétences & Badges ──────────────────────────────────────────
                        .requestMatchers(HttpMethod.GET, "/api/v1/competences/**")
                        .hasAnyAuthority("SUPER_ADMIN", "ADMIN", "SCHOOL_MANAGER", "PEDAGOGICAL_MANAGER", "TEACHER", "STUDENT")

                        .requestMatchers(HttpMethod.POST, "/api/v1/competences/**")
                        .hasAnyAuthority("SUPER_ADMIN", "ADMIN", "PEDAGOGICAL_MANAGER", "TEACHER")

                        .requestMatchers(HttpMethod.DELETE, "/api/v1/competences/**")
                        .hasAnyAuthority("SUPER_ADMIN", "ADMIN")

                        // ── Export PDF ────────────────────────────────────────────────────
                        .requestMatchers(HttpMethod.GET, "/api/v1/pdf/**")
                        .hasAnyAuthority("SUPER_ADMIN", "ADMIN", "SCHOOL_MANAGER", "PEDAGOGICAL_MANAGER", "TEACHER", "STUDENT")

                        .anyRequest().authenticated()


                )
                .authenticationProvider(authenticationProvider())
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {
        return configuration.getAuthenticationManager();
    }
}