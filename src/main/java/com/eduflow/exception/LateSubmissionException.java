package com.eduflow.exception;

public class LateSubmissionException extends RuntimeException {
    public LateSubmissionException(String message) {
        super(message);
    }
}
