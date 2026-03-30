package com.mydbs.backend.pdf;

import com.mydbs.backend.common.exception.ResourceNotFoundException;
import com.mydbs.backend.grades.model.Bulletin;
import com.mydbs.backend.grades.model.GradeBook;
import com.mydbs.backend.grades.model.GradeItem;
import com.mydbs.backend.grades.repository.BulletinRepository;
import com.mydbs.backend.grades.repository.GradeBookRepository;
import com.mydbs.backend.grades.repository.GradeItemRepository;
import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@Transactional(readOnly = true)
public class PdfService {

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    private final BulletinRepository bulletinRepository;
    private final GradeBookRepository gradeBookRepository;
    private final GradeItemRepository gradeItemRepository;

    public PdfService(BulletinRepository bulletinRepository,
                      GradeBookRepository gradeBookRepository,
                      GradeItemRepository gradeItemRepository) {
        this.bulletinRepository = bulletinRepository;
        this.gradeBookRepository = gradeBookRepository;
        this.gradeItemRepository = gradeItemRepository;
    }

    // ── BULLETIN PDF ─────────────────────────────────────────────────────────

    /**
     * Génère un PDF pour un bulletin existant.
     * Utilise les vrais getters du modèle Bulletin :
     *   - getStudent()              → informations étudiant
     *   - getGeneralAverage()       → moyenne générale /20
     *   - getTotalCreditsAcquired() → ECTS acquis
     *   - getRankInCohort()         → rang dans la cohorte
     *   - getHeadTeacherComment()   → appréciation du responsable
     */
    public byte[] generateBulletinPdf(Long bulletinId) {
        Bulletin bulletin = bulletinRepository.findById(bulletinId)
                .orElseThrow(() -> new ResourceNotFoundException("Bulletin introuvable : " + bulletinId));

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        try (PdfWriter writer = new PdfWriter(baos);
             PdfDocument pdf = new PdfDocument(writer);
             Document doc = new Document(pdf)) {

            // ── En-tête ────────────────────────────────────────────────────
            doc.add(new Paragraph("MyDBS — Plateforme Académique")
                    .setFontSize(18).setBold().setTextAlignment(TextAlignment.CENTER));
            doc.add(new Paragraph("BULLETIN DE NOTES")
                    .setFontSize(14).setBold().setTextAlignment(TextAlignment.CENTER));
            doc.add(new Paragraph(" "));

            // ── Informations étudiant ──────────────────────────────────────
            String studentName = bulletin.getStudent().getFirstName()
                    + " " + bulletin.getStudent().getLastName();
            doc.add(new Paragraph("Étudiant : " + studentName).setFontSize(11));
            doc.add(new Paragraph("N° Étudiant : " + bulletin.getStudent().getStudentNumber()).setFontSize(11));
            doc.add(new Paragraph("Semestre : " + bulletin.getSemester()).setFontSize(11));
            String yearLabel = (bulletin.getAcademicYear().getName() != null
                    ? bulletin.getAcademicYear().getName() : "")
                    + (bulletin.getAcademicYear().getCode() != null
                    ? " (" + bulletin.getAcademicYear().getCode() + ")" : "");
            doc.add(new Paragraph("Année académique : " + yearLabel.trim()).setFontSize(11));
            if (bulletin.getPublishedAt() != null) {
                doc.add(new Paragraph("Publié le : " + bulletin.getPublishedAt().format(DATE_FMT)).setFontSize(11));
            }
            doc.add(new Paragraph(" "));

            // ── Notes par cours (lecture du grade items via grade books) ───
            // On charge les grade books de l'étudiant pour ce semestre et cette année
            List<GradeBook> gradeBooks = gradeBookRepository
                    .findByStudentIdAndAcademicYearIdAndSemesterAndArchivedFalse(
                            bulletin.getStudent().getId(),
                            bulletin.getAcademicYear().getId(),
                            bulletin.getSemester());

            if (!gradeBooks.isEmpty()) {
                Table table = new Table(UnitValue.createPercentArray(new float[]{45, 15, 15, 25}))
                        .setWidth(UnitValue.createPercentValue(100));
                table.addHeaderCell(headerCell("Matière / Évaluation"));
                table.addHeaderCell(headerCell("Note /20"));
                table.addHeaderCell(headerCell("Coeff."));
                table.addHeaderCell(headerCell("Type"));

                for (GradeBook gradeBook : gradeBooks) {
                    // Ligne de sous-titre par cours
                    if (gradeBook.getCourse() != null) {
                        String courseTitle = gradeBook.getCourse().getTitle() != null
                                ? gradeBook.getCourse().getTitle() : "Cours " + gradeBook.getCourse().getId();
                        Cell courseCell = new Cell(1, 4)
                                .add(new Paragraph("\u25ba " + courseTitle).setBold().setFontSize(10))
                                .setBackgroundColor(ColorConstants.LIGHT_GRAY);
                        table.addCell(courseCell);
                    }

                    List<GradeItem> items = gradeItemRepository
                            .findByGradeBookIdAndArchivedFalseOrderByCreatedAtDesc(gradeBook.getId());
                    for (GradeItem item : items) {
                        double note = item.getMaxScore() > 0
                                ? Math.round((item.getScore() / item.getMaxScore()) * 20 * 100.0) / 100.0
                                : 0;
                        table.addCell(new Cell().add(new Paragraph(item.getLabel() != null ? item.getLabel() : "-")));
                        table.addCell(new Cell().add(new Paragraph(String.format("%.2f", note)))
                                .setTextAlignment(TextAlignment.CENTER));
                        table.addCell(new Cell().add(new Paragraph(String.format("%.1f", item.getCoefficient())))
                                .setTextAlignment(TextAlignment.CENTER));
                        // itemType est un enum GradeItemType, on utilise .name()
                        String typeLabel = item.getItemType() != null ? item.getItemType().name() : "-";
                        table.addCell(new Cell().add(new Paragraph(typeLabel)));
                    }

                    if (gradeBook.getWeightedAverage() != null) {
                        Cell avgCell = new Cell(1, 4)
                                .add(new Paragraph(String.format("  Moyenne cours : %.2f/20", gradeBook.getWeightedAverage())).setFontSize(10))
                                .setTextAlignment(TextAlignment.RIGHT);
                        table.addCell(avgCell);
                    }
                }
                doc.add(table);
            } else {
                doc.add(new Paragraph("Aucune note disponible pour ce semestre.").setFontSize(11));
            }

            doc.add(new Paragraph(" "));

            // ── Résumé du bulletin ──────────────────────────────────────────
            if (bulletin.getGeneralAverage() != null) {
                doc.add(new Paragraph(String.format("Moyenne générale : %.2f/20", bulletin.getGeneralAverage()))
                        .setFontSize(13).setBold());
            }
            if (bulletin.getTotalCreditsAcquired() != null) {
                doc.add(new Paragraph("ECTS acquis : " + bulletin.getTotalCreditsAcquired()
                        + (bulletin.getTotalCreditsPossible() != null
                        ? " / " + bulletin.getTotalCreditsPossible() : ""))
                        .setFontSize(11));
            }
            if (bulletin.getRankInCohort() != null) {
                String rank = "Rang dans la cohorte : " + bulletin.getRankInCohort();
                if (bulletin.getTotalStudentsInCohort() != null) {
                    rank += " / " + bulletin.getTotalStudentsInCohort();
                }
                doc.add(new Paragraph(rank).setFontSize(11));
            }
            if (bulletin.getClassAverage() != null) {
                doc.add(new Paragraph(String.format("Moyenne de classe : %.2f/20", bulletin.getClassAverage()))
                        .setFontSize(11));
            }
            if (bulletin.getHeadTeacherComment() != null && !bulletin.getHeadTeacherComment().isBlank()) {
                doc.add(new Paragraph(" "));
                doc.add(new Paragraph("Appréciation : " + bulletin.getHeadTeacherComment())
                        .setFontSize(11).setItalic());
            }
            if (bulletin.getCouncilDecision() != null && !bulletin.getCouncilDecision().isBlank()) {
                doc.add(new Paragraph("Décision du conseil : " + bulletin.getCouncilDecision())
                        .setFontSize(11).setBold());
            }

            // ── Pied de page ────────────────────────────────────────────────
            doc.add(new Paragraph(" "));
            doc.add(new Paragraph("Document généré automatiquement par MyDBS le "
                    + java.time.LocalDate.now().format(DATE_FMT))
                    .setFontSize(8).setFontColor(ColorConstants.GRAY).setTextAlignment(TextAlignment.CENTER));

        } catch (Exception e) {
            throw new RuntimeException("Erreur génération PDF bulletin : " + e.getMessage(), e);
        }
        return baos.toByteArray();
    }

    // ── RELEVÉ DE NOTES PDF ───────────────────────────────────────────────────

    /**
     * Génère le relevé de notes complet d'un étudiant pour une année académique.
     * Utilise findByStudentIdAndAcademicYearIdAndArchivedFalseOrderByCourseTitle()
     */
    public byte[] generateTranscriptPdf(Long studentId, Long academicYearId) {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        try (PdfWriter writer = new PdfWriter(baos);
             PdfDocument pdf = new PdfDocument(writer);
             Document doc = new Document(pdf)) {

            doc.add(new Paragraph("MyDBS — Relevé de Notes Officiel")
                    .setFontSize(18).setBold().setTextAlignment(TextAlignment.CENTER));
            doc.add(new Paragraph("Étudiant ID : " + studentId + " | Année académique ID : " + academicYearId)
                    .setFontSize(12).setTextAlignment(TextAlignment.CENTER));
            doc.add(new Paragraph(" "));

            // Utilise la méthode existante du repository
            List<GradeBook> gradeBooks = gradeBookRepository
                    .findByStudentIdAndAcademicYearIdAndArchivedFalseOrderByCourseTitle(studentId, academicYearId);

            if (gradeBooks.isEmpty()) {
                doc.add(new Paragraph("Aucune note disponible pour cet étudiant et cette année.").setFontSize(11));
            } else {
                for (GradeBook gradeBook : gradeBooks) {
                    String courseTitle = gradeBook.getCourse() != null && gradeBook.getCourse().getTitle() != null
                            ? gradeBook.getCourse().getTitle() : "Cours ID " + (gradeBook.getCourse() != null ? gradeBook.getCourse().getId() : "?");
                    doc.add(new Paragraph(courseTitle).setFontSize(11).setBold());
                    if (gradeBook.getSemester() != null) {
                        doc.add(new Paragraph("Semestre : " + gradeBook.getSemester()).setFontSize(10));
                    }

                    List<GradeItem> items = gradeItemRepository
                            .findByGradeBookIdAndArchivedFalseOrderByCreatedAtDesc(gradeBook.getId());

                    Table table = new Table(UnitValue.createPercentArray(new float[]{60, 20, 20}))
                            .setWidth(UnitValue.createPercentValue(100));
                    table.addHeaderCell(headerCell("Évaluation"));
                    table.addHeaderCell(headerCell("Note /20"));
                    table.addHeaderCell(headerCell("Coeff."));

                    for (GradeItem item : items) {
                        double note = item.getMaxScore() > 0
                                ? Math.round((item.getScore() / item.getMaxScore()) * 20 * 100.0) / 100.0 : 0;
                        table.addCell(new Cell().add(new Paragraph(item.getLabel() != null ? item.getLabel() : "-")));
                        table.addCell(new Cell().add(new Paragraph(String.format("%.2f", note)))
                                .setTextAlignment(TextAlignment.CENTER));
                        table.addCell(new Cell().add(new Paragraph(String.format("%.1f", item.getCoefficient())))
                                .setTextAlignment(TextAlignment.CENTER));
                    }
                    doc.add(table);

                    if (gradeBook.getWeightedAverage() != null) {
                        doc.add(new Paragraph(String.format("Moyenne : %.2f/20", gradeBook.getWeightedAverage()))
                                .setFontSize(10).setTextAlignment(TextAlignment.RIGHT));
                    }
                    doc.add(new Paragraph(" "));
                }
            }

            doc.add(new Paragraph("Document officiel MyDBS — " + java.time.LocalDate.now().format(DATE_FMT))
                    .setFontSize(8).setFontColor(ColorConstants.GRAY).setTextAlignment(TextAlignment.CENTER));

        } catch (Exception e) {
            throw new RuntimeException("Erreur génération PDF relevé de notes : " + e.getMessage(), e);
        }
        return baos.toByteArray();
    }

    // ── HELPER ───────────────────────────────────────────────────────────────

    private Cell headerCell(String text) {
        return new Cell().add(new Paragraph(text).setBold())
                .setBackgroundColor(ColorConstants.LIGHT_GRAY)
                .setTextAlignment(TextAlignment.CENTER);
    }
}
