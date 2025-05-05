/**
 * DocumentGallery component
 * Component for managing and viewing documents
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  Modal,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../../../styles/theme';
import Button from '../../../components/atoms/Button';

// Document types and their icons
const DOCUMENT_TYPES = {
  IMAGE: {
    icon: 'image-outline',
    extensions: ['jpg', 'jpeg', 'png', 'gif'],
  },
  PDF: {
    icon: 'document-text-outline',
    extensions: ['pdf'],
  },
  DOCUMENT: {
    icon: 'document-outline',
    extensions: ['doc', 'docx', 'txt', 'rtf'],
  },
  SPREADSHEET: {
    icon: 'grid-outline',
    extensions: ['xls', 'xlsx', 'csv'],
  },
  PRESENTATION: {
    icon: 'easel-outline',
    extensions: ['ppt', 'pptx'],
  },
  OTHER: {
    icon: 'document-outline',
    extensions: [],
  },
};

// Get document type from file extension
const getDocumentType = filename => {
  if (!filename) return DOCUMENT_TYPES.OTHER;

  const extension = filename.split('.').pop().toLowerCase();

  for (const [type, data] of Object.entries(DOCUMENT_TYPES)) {
    if (data.extensions.includes(extension)) {
      return { type, ...data };
    }
  }

  return DOCUMENT_TYPES.OTHER;
};

// Format file size
const formatFileSize = bytes => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Format date
const formatDate = date => {
  if (!date) return '';

  const d = new Date(date);
  return d.toLocaleDateString() + ' ' + d.toLocaleTimeString();
};

const DocumentGallery = ({
  onDocumentSelect,
  onCancel,
  documentCategory = 'all',
  allowMultipleSelection = false,
  maxSelections = 5,
}) => {
  // Permission state
  const [hasPermission, setHasPermission] = useState(null);

  // Documents state
  const [documents, setDocuments] = useState([]);

  // Selected documents
  const [selectedDocuments, setSelectedDocuments] = useState([]);

  // Loading state
  const [loading, setLoading] = useState(false);

  // Preview modal
  const [previewVisible, setPreviewVisible] = useState(false);

  // Categories
  const [categories, setCategories] = useState(['all', 'images', 'documents', 'other']);
  const [activeCategory, setActiveCategory] = useState(documentCategory);

  // Request media library permission and load documents on mount
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);

        // Request media library permissions
        const { status } = await MediaLibrary.requestPermissionsAsync();
        setHasPermission(status === 'granted');

        if (status === 'granted') {
          // Load documents
          await loadDocuments();
        }
      } catch (error) {
        console.error('Error initializing document gallery:', error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Load documents from media library and app directory
  const loadDocuments = async () => {
    try {
      setLoading(true);

      // Create documents directory if it doesn't exist
      const documentsDir = `${FileSystem.documentDirectory}documents/`;
      const dirInfo = await FileSystem.getInfoAsync(documentsDir);

      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(documentsDir, { intermediates: true });
      }

      // Read documents from app directory
      const files = await FileSystem.readDirectoryAsync(documentsDir);

      const documentsList = await Promise.all(
        files.map(async filename => {
          const fileUri = `${documentsDir}${filename}`;
          const fileInfo = await FileSystem.getInfoAsync(fileUri);

          return {
            id: fileUri,
            uri: fileUri,
            filename,
            size: fileInfo.size,
            modificationTime: fileInfo.modificationTime,
            documentType: getDocumentType(filename),
            isLocal: true,
          };
        })
      );

      // Get media library assets (photos and videos)
      const mediaAssets = await MediaLibrary.getAssetsAsync({
        mediaType: ['photo', 'video'],
        first: 50,
        sortBy: [['creationTime', false]],
      });

      const mediaDocuments = await Promise.all(
        mediaAssets.assets.map(async asset => {
          const assetInfo = await MediaLibrary.getAssetInfoAsync(asset.id);

          return {
            id: asset.id,
            uri: asset.uri,
            filename: asset.filename,
            size: asset.fileSize,
            modificationTime: asset.modificationTime,
            documentType: getDocumentType(asset.filename),
            isLocal: false,
            mediaDetails: assetInfo,
          };
        })
      );

      // Combine and sort documents by modification time
      const allDocuments = [...documentsList, ...mediaDocuments].sort((a, b) => {
        return b.modificationTime - a.modificationTime;
      });

      setDocuments(allDocuments);
    } catch (error) {
      console.error('Error loading documents:', error);
      Alert.alert('Error', 'Failed to load documents. Please check permissions and try again.', [
        { text: 'OK' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Filter documents by category
  const getFilteredDocuments = () => {
    if (activeCategory === 'all') {
      return documents;
    }

    if (activeCategory === 'images') {
      return documents.filter(doc =>
        DOCUMENT_TYPES.IMAGE.extensions.includes(doc.filename.split('.').pop().toLowerCase())
      );
    }

    if (activeCategory === 'documents') {
      return documents.filter(
        doc =>
          DOCUMENT_TYPES.PDF.extensions.includes(doc.filename.split('.').pop().toLowerCase()) ||
          DOCUMENT_TYPES.DOCUMENT.extensions.includes(
            doc.filename.split('.').pop().toLowerCase()
          ) ||
          DOCUMENT_TYPES.SPREADSHEET.extensions.includes(
            doc.filename.split('.').pop().toLowerCase()
          ) ||
          DOCUMENT_TYPES.PRESENTATION.extensions.includes(
            doc.filename.split('.').pop().toLowerCase()
          )
      );
    }

    if (activeCategory === 'other') {
      return documents.filter(doc => {
        const ext = doc.filename.split('.').pop().toLowerCase();
        return (
          !DOCUMENT_TYPES.IMAGE.extensions.includes(ext) &&
          !DOCUMENT_TYPES.PDF.extensions.includes(ext) &&
          !DOCUMENT_TYPES.DOCUMENT.extensions.includes(ext) &&
          !DOCUMENT_TYPES.SPREADSHEET.extensions.includes(ext) &&
          !DOCUMENT_TYPES.PRESENTATION.extensions.includes(ext)
        );
      });
    }

    return documents;
  };

  // Toggle document selection
  const toggleDocumentSelection = document => {
    if (selectedDocuments.some(doc => doc.id === document.id)) {
      // Document is already selected, remove it
      setSelectedDocuments(selectedDocuments.filter(doc => doc.id !== document.id));
    } else {
      // Document is not selected, add it if not exceeding max selections
      if (!allowMultipleSelection) {
        // Single selection mode
        setSelectedDocuments([document]);
      } else if (selectedDocuments.length < maxSelections) {
        // Multiple selection mode, not exceeding max
        setSelectedDocuments([...selectedDocuments, document]);
      } else {
        // Exceeding max selections
        Alert.alert(
          'Maximum Selections Reached',
          `You can only select up to ${maxSelections} documents.`,
          [{ text: 'OK' }]
        );
      }
    }
  };

  // Preview document
  const previewDocument = document => {
    setPreviewDocument(document);
    setPreviewVisible(true);
  };

  // Handle save selected documents
  const handleSave = () => {
    if (selectedDocuments.length === 0) {
      Alert.alert('No Documents Selected', 'Please select at least one document.', [
        { text: 'OK' },
      ]);
      return;
    }

    if (onDocumentSelect) {
      onDocumentSelect(allowMultipleSelection ? selectedDocuments : selectedDocuments[0]);
    }
  };

  // Render document item
  const renderDocumentItem = ({ item }) => {
    const isSelected = selectedDocuments.some(doc => doc.id === item.id);
    const documentType = item.documentType || getDocumentType(item.filename);
    const isImage = DOCUMENT_TYPES.IMAGE.extensions.includes(
      item.filename.split('.').pop().toLowerCase()
    );

    return (
      <TouchableOpacity
        style={[styles.documentItem, isSelected && styles.selectedDocumentItem]}
        onPress={() => toggleDocumentSelection(item)}
        onLongPress={() => previewDocument(item)}
      >
        <View style={styles.documentPreview}>
          {isImage ? (
            <Image source={{ uri: item.uri }} style={styles.documentThumbnail} resizeMode="cover" />
          ) : (
            <View style={styles.documentIconContainer}>
              <Ionicons name={documentType.icon} size={40} color={colors.text.secondary} />
            </View>
          )}

          {isSelected && (
            <View style={styles.selectionIndicator}>
              <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
            </View>
          )}
        </View>

        <View style={styles.documentInfo}>
          <Text style={styles.documentName} numberOfLines={1}>
            {item.filename}
          </Text>
          <Text style={styles.documentDetails}>
            {formatFileSize(item.size)} • {formatDate(item.modificationTime)}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  // Render category tabs
  const renderCategoryTabs = () => {
    return (
      <View style={styles.categoryTabs}>
        {categories.map(category => (
          <TouchableOpacity
            key={category}
            style={[styles.categoryTab, activeCategory === category && styles.activeCategoryTab]}
            onPress={() => setActiveCategory(category)}
          >
            <Text
              style={[
                styles.categoryTabText,
                activeCategory === category && styles.activeCategoryTabText,
              ]}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  // Handle camera permission not granted
  if (hasPermission === null) {
    return (
      <View style={styles.permissionContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.permissionText}>Requesting media library permission...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.permissionContainer}>
        <Ionicons name="images-outline" size={48} color={colors.error} />
        <Text style={styles.permissionText}>
          Media library permission not granted. Please enable media library access in your device
          settings.
        </Text>
        <Button
          title="Cancel"
          variant="outline"
          onPress={onCancel}
          style={styles.permissionButton}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Document Gallery</Text>
        <Text style={styles.selectionCount}>
          {selectedDocuments.length > 0
            ? `${selectedDocuments.length}/${allowMultipleSelection ? maxSelections : 1} selected`
            : 'Select documents'}
        </Text>
      </View>

      {/* Category Tabs */}
      {renderCategoryTabs()}

      {/* Document List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading documents...</Text>
        </View>
      ) : (
        <FlatList
          data={getFilteredDocuments()}
          renderItem={renderDocumentItem}
          keyExtractor={item => item.id}
          numColumns={2}
          contentContainerStyle={styles.documentList}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="document-outline" size={48} color={colors.text.secondary} />
              <Text style={styles.emptyText}>No documents found</Text>
            </View>
          }
        />
      )}

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <Button title="Cancel" variant="outline" onPress={onCancel} style={styles.cancelButton} />
        <Button
          title={`Select ${selectedDocuments.length > 0 ? `(${selectedDocuments.length})` : ''}`}
          onPress={handleSave}
          style={styles.saveButton}
          disabled={selectedDocuments.length === 0}
        />
      </View>

      {/* Document Preview Modal */}
      <Modal
        visible={previewVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setPreviewVisible(false)}
      >
        <View style={styles.previewModalContainer}>
          <View style={styles.previewModalContent}>
            <View style={styles.previewModalHeader}>
              <Text style={styles.previewModalTitle} numberOfLines={1}>
                {previewDocument?.filename || 'Document Preview'}
              </Text>
              <TouchableOpacity
                style={styles.previewModalCloseButton}
                onPress={() => setPreviewVisible(false)}
              >
                <Ionicons name="close" size={24} color={colors.text.primary} />
              </TouchableOpacity>
            </View>

            <View style={styles.previewContainer}>
              {previewDocument &&
              DOCUMENT_TYPES.IMAGE.extensions.includes(
                previewDocument.filename.split('.').pop().toLowerCase()
              ) ? (
                <Image
                  source={{ uri: previewDocument.uri }}
                  style={styles.previewImage}
                  resizeMode="contain"
                />
              ) : (
                <View style={styles.previewPlaceholder}>
                  <Ionicons
                    name={previewDocument?.documentType?.icon || 'document-outline'}
                    size={80}
                    color={colors.text.secondary}
                  />
                  <Text style={styles.previewPlaceholderText}>Preview not available</Text>
                </View>
              )}
            </View>

            <View style={styles.previewModalFooter}>
              <Button
                title="Close"
                variant="outline"
                onPress={() => setPreviewVisible(false)}
                style={styles.previewModalButton}
              />
              <Button
                title={
                  selectedDocuments.some(doc => doc.id === previewDocument?.id)
                    ? 'Deselect'
                    : 'Select'
                }
                onPress={() => {
                  if (previewDocument) {
                    toggleDocumentSelection(previewDocument);
                    setPreviewVisible(false);
                  }
                }}
                style={styles.previewModalButton}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: typography.fontSize.lg,
    fontWeight: '600',
    color: colors.text.primary,
  },
  selectionCount: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  categoryTabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  categoryTab: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  activeCategoryTab: {
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  categoryTabText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  activeCategoryTabText: {
    color: colors.primary,
    fontWeight: '500',
  },
  documentList: {
    padding: spacing.sm,
  },
  documentItem: {
    flex: 1,
    margin: spacing.xs,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.secondary,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  selectedDocumentItem: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  documentPreview: {
    aspectRatio: 1,
    position: 'relative',
  },
  documentThumbnail: {
    width: '100%',
    height: '100%',
  },
  documentIconContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.tertiary,
  },
  selectionIndicator: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },
  documentInfo: {
    padding: spacing.sm,
  },
  documentName: {
    fontSize: typography.fontSize.sm,
    fontWeight: '500',
    color: colors.text.primary,
    marginBottom: 2,
  },
  documentDetails: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  cancelButton: {
    flex: 1,
    marginRight: spacing.sm,
  },
  saveButton: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  permissionText: {
    fontSize: typography.fontSize.md,
    color: colors.text.secondary,
    textAlign: 'center',
    marginVertical: spacing.md,
  },
  permissionButton: {
    marginTop: spacing.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: typography.fontSize.md,
    color: colors.text.secondary,
    marginTop: spacing.md,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyText: {
    fontSize: typography.fontSize.md,
    color: colors.text.secondary,
    marginTop: spacing.md,
  },
  previewModalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  previewModalContent: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  previewModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  previewModalTitle: {
    flex: 1,
    fontSize: typography.fontSize.md,
    fontWeight: '600',
    color: colors.text.primary,
  },
  previewModalCloseButton: {
    padding: spacing.xs,
  },
  previewContainer: {
    aspectRatio: 4 / 3,
    backgroundColor: colors.background.tertiary,
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  previewPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewPlaceholderText: {
    fontSize: typography.fontSize.md,
    color: colors.text.secondary,
    marginTop: spacing.md,
  },
  previewModalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  previewModalButton: {
    flex: 1,
    marginHorizontal: spacing.xs,
  },
});

export default DocumentGallery;
