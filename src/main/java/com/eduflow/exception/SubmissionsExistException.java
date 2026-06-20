package com.eduflow.exception;

public class SubmissionsExistException extends RuntimeException {
    public SubmissionsExistException(String message) {
        super(message);
    }
}
