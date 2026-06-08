package com.eduflow.repository;

import com.eduflow.domain.Course;
import org.springframework.data.jpa.domain.Specification;

public class CourseSpecification {

    private CourseSpecification() {}

    /** Returns published courses matching keyword (title/description) and/or courseCode. */
    public static Specification<Course> search(String keyword, String courseCode) {
        return (root, query, cb) -> {
            var predicates = new java.util.ArrayList<jakarta.persistence.criteria.Predicate>();

            // Only published courses are searchable
            predicates.add(cb.isTrue(root.get("published")));

            if (keyword != null && !keyword.isBlank()) {
                String pattern = "%" + keyword.toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("title")), pattern),
                        cb.like(cb.lower(root.get("description")), pattern)
                ));
            }

            if (courseCode != null && !courseCode.isBlank()) {
                predicates.add(cb.equal(root.get("courseCode"), courseCode));
            }

            return cb.and(predicates.toArray(new jakarta.persistence.criteria.Predicate[0]));
        };
    }
}
