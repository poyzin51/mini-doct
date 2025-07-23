package com.example.medicalinter.model;

import java.time.DayOfWeek;
import java.time.LocalTime;

public class AvailabilityRange {
    private DayOfWeek dayOfWeek;
    private LocalTime startTime;
    private LocalTime endTime;
    private int intervalMinutes;

    public AvailabilityRange() {
    }

    public AvailabilityRange(DayOfWeek dayOfWeek, LocalTime startTime, LocalTime endTime, int intervalMinutes) {
        this.dayOfWeek = dayOfWeek;
        this.startTime = startTime;
        this.endTime = endTime;
        this.intervalMinutes = intervalMinutes;
    }

    public DayOfWeek getDayOfWeek() {
        return dayOfWeek;
    }

    public void setDayOfWeek(DayOfWeek dayOfWeek) {
        this.dayOfWeek = dayOfWeek;
    }

    public LocalTime getStartTime() {
        return startTime;
    }

    public void setStartTime(LocalTime startTime) {
        this.startTime = startTime;
    }

    public LocalTime getEndTime() {
        return endTime;
    }

    public void setEndTime(LocalTime endTime) {
        this.endTime = endTime;
    }

    public int getIntervalMinutes() {
        return intervalMinutes;
    }

    public void setIntervalMinutes(int intervalMinutes) {
        this.intervalMinutes = intervalMinutes;
    }
}