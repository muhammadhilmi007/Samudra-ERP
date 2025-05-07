/**
 * Samudra Paket ERP - Tracking Repository Unit Tests
 */

const mongoose = require('mongoose');
const trackingRepository = require('../../../../domain/repositories/trackingRepository');
const TrackingEvent = require('../../../../domain/models/trackingEvent');
const ShipmentOrder = require('../../../../domain/models/shipmentOrder');
const Shipment = require('../../../../domain/models/shipment');

// Mock dependencies
jest.mock('../../../../domain/models/trackingEvent');
jest.mock('../../../../domain/models/shipmentOrder');
jest.mock('../../../../domain/models/shipment');
jest.mock('../../../../domain/models/pickupRequest');
jest.mock('../../../../domain/models/deliveryOrder');
jest.mock('../../../../api/middleware/gateway/logger', () => ({
  error: jest.fn(),
  info: jest.fn(),
}));

describe('Tracking Repository', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createTrackingEvent', () => {
    it('should create a tracking event successfully', async () => {
      // Arrange
      const mockTrackingEvent = {
        save: jest.fn().mockResolvedValue(true),
      };
      TrackingEvent.mockImplementation(() => mockTrackingEvent);
      TrackingEvent.generateTrackingCode.mockReturnValue('WB-12345678');

      const trackingEventData = {
        entityType: 'shipment_order',
        entityId: 'mockEntityId',
        eventType: 'created',
        performer: 'mockUserId',
      };

      // Act
      await trackingRepository.createTrackingEvent(trackingEventData);

      // Assert
      expect(TrackingEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          trackingCode: 'WB-12345678',
          entityType: 'shipment_order',
          entityId: 'mockEntityId',
          eventType: 'created',
          performer: 'mockUserId',
        })
      );
      expect(mockTrackingEvent.save).toHaveBeenCalled();
    });

    it('should use provided tracking code if available', async () => {
      // Arrange
      const mockTrackingEvent = {
        save: jest.fn().mockResolvedValue(true),
      };
      TrackingEvent.mockImplementation(() => mockTrackingEvent);

      const trackingEventData = {
        trackingCode: 'CUSTOM-CODE',
        entityType: 'shipment_order',
        entityId: 'mockEntityId',
        eventType: 'created',
        performer: 'mockUserId',
      };

      // Act
      await trackingRepository.createTrackingEvent(trackingEventData);

      // Assert
      expect(TrackingEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          trackingCode: 'CUSTOM-CODE',
        })
      );
      expect(TrackingEvent.generateTrackingCode).not.toHaveBeenCalled();
    });

    it('should throw an error if saving fails', async () => {
      // Arrange
      const mockError = new Error('Database error');
      const mockTrackingEvent = {
        save: jest.fn().mockRejectedValue(mockError),
      };
      TrackingEvent.mockImplementation(() => mockTrackingEvent);
      TrackingEvent.generateTrackingCode.mockReturnValue('WB-12345678');

      const trackingEventData = {
        entityType: 'shipment_order',
        entityId: 'mockEntityId',
        eventType: 'created',
        performer: 'mockUserId',
      };

      // Act & Assert
      await expect(trackingRepository.createTrackingEvent(trackingEventData)).rejects.toThrow(
        mockError
      );
    });
  });

  describe('getTrackingEventsByCode', () => {
    it('should return tracking events with pagination metadata', async () => {
      // Arrange
      const mockEvents = [{ _id: 'event1' }, { _id: 'event2' }];
      TrackingEvent.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        populate: jest.fn().mockResolvedValue(mockEvents),
      });
      TrackingEvent.countDocuments.mockResolvedValue(10);

      // Act
      const result = await trackingRepository.getTrackingEventsByCode('WB-12345678');

      // Assert
      expect(TrackingEvent.find).toHaveBeenCalledWith({ trackingCode: 'WB-12345678' });
      expect(result.data).toEqual(mockEvents);
      expect(result.pagination).toEqual(
        expect.objectContaining({
          totalCount: 10,
          totalPages: 1,
        })
      );
    });

    it('should apply customer visibility filter if specified', async () => {
      // Arrange
      TrackingEvent.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        populate: jest.fn().mockResolvedValue([]),
      });
      TrackingEvent.countDocuments.mockResolvedValue(0);

      // Act
      await trackingRepository.getTrackingEventsByCode('WB-12345678', { visibleToCustomer: true });

      // Assert
      expect(TrackingEvent.find).toHaveBeenCalledWith({
        trackingCode: 'WB-12345678',
        visibleToCustomer: true,
      });
    });
  });

  describe('generateTrackingTimeline', () => {
    it('should generate a timeline from tracking events', async () => {
      // Arrange
      const mockEvents = [
        {
          _id: 'event1',
          entityType: 'shipment_order',
          entityId: 'mockEntityId',
          eventType: 'created',
          timestamp: new Date('2023-01-01'),
          status: 'created',
        },
        {
          _id: 'event2',
          entityType: 'shipment_order',
          entityId: 'mockEntityId',
          eventType: 'status_updated',
          timestamp: new Date('2023-01-02'),
          status: 'processing',
        },
      ];

      TrackingEvent.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        populate: jest.fn().mockResolvedValue(mockEvents),
      });

      const mockShipmentOrder = {
        _id: 'mockEntityId',
        waybillNo: 'WB12345',
      };

      ShipmentOrder.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockShipmentOrder),
      });

      // Act
      const result = await trackingRepository.generateTrackingTimeline('WB-12345678');

      // Assert
      expect(TrackingEvent.find).toHaveBeenCalledWith({ trackingCode: 'WB-12345678' });
      expect(result.trackingCode).toBe('WB-12345678');
      expect(result.entityType).toBe('shipment_order');
      expect(result.entityId).toBe('mockEntityId');
      expect(result.currentStatus).toBe('processing');
      expect(result.events).toHaveLength(2);
    });

    it('should throw an error if no events are found', async () => {
      // Arrange
      TrackingEvent.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        populate: jest.fn().mockResolvedValue([]),
      });
      // Mock ShipmentOrder.findById agar tidak resolve entityDetails
      ShipmentOrder.findById.mockReturnValue({ select: jest.fn().mockResolvedValue(null) });

      // Act & Assert
      await expect(trackingRepository.generateTrackingTimeline('INVALID-CODE')).rejects.toThrow(
        'No tracking events found for the provided tracking code'
      );
    });
  });

  describe('updateLocation', () => {
    it('should create a location update event', async () => {
      // Arrange
      const mockLatestEvent = {
        _id: 'event1',
        trackingCode: 'WB-12345678',
        status: 'in_transit',
        location: { coordinates: [0, 0] },
      };
      TrackingEvent.findOne.mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockLatestEvent),
      });
      const mockCreatedEvent = { _id: 'newEvent' };
      trackingRepository.createTrackingEvent = jest.fn().mockResolvedValue(mockCreatedEvent);

      // Act
      const result = await trackingRepository.updateLocation(
        'shipment',
        'mockEntityId',
        { coordinates: { coordinates: [1, 1] } },
        'mockUserId'
      );

      // Assert
      expect(TrackingEvent.findOne).toHaveBeenCalledWith({
        entityType: 'shipment',
        entityId: 'mockEntityId',
      });
      expect(trackingRepository.createTrackingEvent).toHaveBeenCalledWith(expect.objectContaining({
        trackingCode: 'WB-12345678',
        entityType: 'shipment',
        entityId: 'mockEntityId',
        eventType: 'location_updated',
        status: 'in_transit',
      }));
      expect(result).toBe(mockCreatedEvent);
    });

    it('should throw an error if no previous events exist', async () => {
      // Arrange
      TrackingEvent.findOne.mockReturnValue({
        sort: jest.fn().mockResolvedValue(null),
      });

      // Act & Assert
      await expect(
        trackingRepository.updateLocation(
          'shipment',
          'mockEntityId',
          { coordinates: { coordinates: [1, 1] } },
          'mockUserId'
        )
      ).rejects.toThrow('No tracking events found for shipment with ID mockEntityId');
    });
  });

  describe('findTrackingByReference', () => {
    it('should find tracking by direct tracking code', async () => {
      // Arrange
      const mockEvent = { trackingCode: 'WB-12345678' };
      TrackingEvent.findOne.mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockEvent),
      });
      const mockTimeline = { trackingCode: 'WB-12345678' };
      const spy = jest.spyOn(trackingRepository, 'generateTrackingTimeline').mockResolvedValue(mockTimeline);

      // Act
      const result = await trackingRepository.findTrackingByReference('WB-12345678');

      // Assert
      expect(TrackingEvent.findOne).toHaveBeenCalledWith({ trackingCode: 'WB-12345678' });
      expect(spy).toHaveBeenCalledWith('WB-12345678', true);
      expect(result).toBe(mockTimeline);
    });

    it('should find tracking by shipment order waybill number', async () => {
      // Arrange
      TrackingEvent.findOne
        .mockReturnValueOnce({ sort: jest.fn().mockResolvedValue(null) })
        .mockReturnValueOnce({ sort: jest.fn().mockResolvedValue({ trackingCode: 'WB-12345678' }) });
      const mockShipmentOrder = { _id: 'mockEntityId' };
      ShipmentOrder.findOne.mockResolvedValue(mockShipmentOrder);
      const mockTimeline = { trackingCode: 'WB-12345678', entityType: 'shipment_order', entityId: 'mockEntityId' };
      const spy = jest.spyOn(trackingRepository, 'generateTrackingTimeline').mockResolvedValue(mockTimeline);

      // Act
      const result = await trackingRepository.findTrackingByReference('WB12345');

      // Assert
      expect(ShipmentOrder.findOne).toHaveBeenCalledWith({ waybillNo: 'WB12345' });
      expect(TrackingEvent.findOne).toHaveBeenCalledWith({
        entityType: 'shipment_order',
        entityId: 'mockEntityId',
      });
      expect(result).toMatchObject({
        trackingCode: 'WB-12345678',
        entityType: 'shipment_order',
        entityId: 'mockEntityId',
      });
      expect(spy).toHaveBeenCalledWith('WB-12345678', true);
    });

    it('should throw an error if no tracking information is found', async () => {
      // Arrange
      TrackingEvent.findOne.mockReturnValue({
        sort: jest.fn().mockResolvedValue(null),
      });

      ShipmentOrder.findOne.mockResolvedValue(null);
      Shipment.findOne.mockResolvedValue(null);

      // Mock other entity lookups as needed

      // Act & Assert
      await expect(trackingRepository.findTrackingByReference('INVALID-REF')).rejects.toThrow(
        'No tracking information found for the provided reference'
      );
    });
  });
});
